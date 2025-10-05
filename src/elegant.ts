import * as fs from 'node:fs';
import {Connection} from 'mysql2/promise'
import QueryBuilder from './query-builder';
import path from 'node:path';
import {pathToFileURL} from 'url';

export default abstract class Elegant {
  public connection:Connection;

  protected static pool:Map<string,Elegant> = new Map()
  protected config:ElegantConfig;

  public abstract connect(config:ConnectionConfig):Promise<Elegant>

  public abstract transaction(callback:(db:Elegant) => void):Promise<void>

  public abstract select<T>(query:string, params?:Scalar[]):Promise<T[]>

  public abstract query(query:string, params?:Scalar[]):Promise<any>

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
    if (this.pool.has(name)) return this.pool.get(name)
    // get elegant configuration
    let config = await this.getConfiguration()
    config = JSON.parse(JSON.stringify(config))
    // check if config has connections configured
    if (!config.connections) throw new Error('No database connections configured')
    // if no connection name is provided, use default connection
    name = name ? name : config.default;
    // check if the connection name is valid
    if (!name) throw new Error('No database connection name provided')
    const dialect = config.connections[name].dialect
    let elegant:Elegant;
    switch (dialect) {
      case 'mysql':
        const MySql = ( await import(path.resolve(__filename, '../mysql'))).default;
        elegant = new MySql();
        break;
      default:
        throw new Error(`Unsupported database driver: ${dialect}`)
    }
    this.pool.set(name, elegant)
    return elegant.connect(config.connections[name])
  }

  private static async getConfiguration():Promise<ElegantConfig> {
    let configPath = process.cwd() + '/elegant.config.js'
    if (process.env.ELEGANT_CONFIG_PATH) configPath = process.env.ELEGANT_CONFIG_PATH
    if (!fs.existsSync(configPath)) throw new Error(`Elegant Configuration file not found at ${configPath}`)
    const {default:Config} = await import(pathToFileURL(configPath).href)
    return Config;
  }

}
