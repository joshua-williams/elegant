import * as fs from 'node:fs';
import {Connection, createConnection} from 'mysql2/promise'
import QueryBuilder from './query-builder';

abstract class Elegant {
  public connection:Connection;

  protected static pool:ConnectionConfig[] = [];
  protected config:ElegantConfig;

  public abstract connect(config:ConnectionConfig):Promise<Elegant>

  public abstract select<T>(query:string, params?:Scalar[]):Promise<T[]>

  public abstract insert(query:string, params?:Scalar[]):Promise<number>

  public abstract update(query:string, params?:Scalar[]):Promise<number>

  public abstract delete(query:string, params?:Scalar[]):Promise<any>

  public abstract statement(query:string, params?:Scalar[][]):Promise<any>

  public abstract scalar(query:string, params?:Scalar[]):Promise<Scalar>

  public abstract close():Promise<void>

  table(tableName:string):QueryBuilder {
    const qb = new QueryBuilder();
    return qb.table(tableName)
  }

  static async connection(name?:string):Promise<Elegant>{
    // todo check if connection is already open
    // todo check if connection is already in pool
    // todo check if connection is in config
    const config = JSON.parse(JSON.stringify(this.getConfiguration()))
    name = name ? name : config.default;
    if (!name) throw new Error('No database connection name provided')
    const driver = config.connections[name].driver
    let elegant:Elegant;
    switch (driver) {
      case 'mysql2':
        const MySql = ( require('./mysql')).default;
        elegant = new MySql();
        break;
      default:
        throw new Error(`Unsupported database driver: ${driver}`)
    }
    return elegant.connect(config.connections[name])
  }

  private static getConfiguration():ElegantConfig {
    const configPath = process.cwd() + '/elegant.config.js'
    if (!fs.existsSync(configPath)) throw new Error(`Elegant Configuration file not found at ${configPath}`)
    return require(configPath)
  }

}

export default Elegant
