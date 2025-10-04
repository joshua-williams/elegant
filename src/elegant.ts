import * as fs from 'node:fs';
import {Connection, createConnection} from 'mysql2/promise'
import QueryBuilder from './query-builder';
import path from 'node:path';

export default abstract class Elegant {
  public connection:Connection;

  protected static pool:Record<string,Elegant>;
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
    // check if the connection pool is initialized
    if (this.pool[name]) return this.pool[name]
    // get elegant configuration
    const config = JSON.parse(JSON.stringify(this.getConfiguration()))
    // check if config has connections configured
    if (!config.connections) throw new Error('No database connections configured')
    // if no connection name is provided, use default connection
    name = name ? name : config.default;
    // check if the connection name is valid
    if (!name) throw new Error('No database connection name provided')
    const driver = config.connections[name].driver
    let elegant:Elegant;
    switch (driver) {
      case 'mysql2':
        const MySql = ( await import(path.resolve(__filename, '../mysql'))).default;
        elegant = new MySql();
        break;
      default:
        throw new Error(`Unsupported database driver: ${driver}`)
    }
    this.pool[name] = elegant;
    return elegant.connect(config.connections[name])
  }

  private static async getConfiguration():Promise<ElegantConfig> {
    const configPath = process.cwd() + '/elegant.config.js'
    if (!fs.existsSync(configPath)) throw new Error(`Elegant Configuration file not found at ${configPath}`)
    return await import(configPath)
  }

}
