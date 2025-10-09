import {Connection} from 'mysql2/promise'
import QueryBuilder from './QueryBuilder';
import path from 'node:path';
import { Scalar, ConnectionConfig} from '../types';
import {getAppConfig} from '../lib/config';

export default abstract class Elegant{
  public connection:Connection;
  protected static pool:Map<string,Elegant> = new Map()
  protected config:ConnectionConfig;

  public connect(config:ConnectionConfig):Promise<Elegant> {
    this.config = config
    return Promise.resolve(this)
  }
  public abstract beginTransaction():Promise<any>

  public abstract commit():Promise<any>

  public abstract rollback():Promise<any>

  public abstract transaction(callback:(db:Elegant) => void):Promise<void>

  public abstract select<T>(query:string, params?:Scalar[]):Promise<T[]>

  public abstract query<T>(query:string, params?:Scalar[]):Promise<T[]>

  public abstract scalar<T>(query:string, params?:Scalar[]):Promise<T|Scalar>

  public abstract insert(query:string, params?:Scalar[]):Promise<number>

  public abstract update(query:string, params?:Scalar[]):Promise<number>

  public abstract delete(query:string, params?:Scalar[]):Promise<any>

  public abstract statement(query:string, params?:Scalar[]):Promise<any>

  public abstract statements(query:string, params?:Scalar[][]):Promise<any>


  public abstract close():Promise<void>

  table(tableName:string):QueryBuilder {
    const qb = new QueryBuilder();
    return qb.table(tableName)
  }

  static async connection(name?:string):Promise<Elegant>{
    // check if the connection pool is initialized
    if (this.pool.has(name)) return this.pool.get(name)
    // get elegant configuration
    const config = await getAppConfig()
    // check if config has connections configured
    if (!config.connections) throw new Error('No database connections configured')
    // if no connection name is provided, use the default connection
    name = name ? name : config.default;
    // check if the connection name is valid
    if (!name) throw new Error('No database connection name provided')
    const dialect = config.connections[name].dialect
    let elegant:Elegant;
    switch (dialect) {
      case 'mariadb':
        const MariaDb = ( await import(path.resolve(__filename, '../../lib/elegant/MariaDb'))).default;
        elegant = new MariaDb();
        break;
      case 'mysql':
        const MySql = ( await import(path.resolve(__filename, '../../lib/elegant/Mysql'))).default;
        elegant = new MySql();
        break;
      case 'postgres':
        const Postgres = ( await import(path.resolve(__filename, '../../lib/elegant/Postgres'))).default;
        elegant = new Postgres();
        break
      default:
        throw new Error(`Unsupported database driver: ${dialect}`)
    }
    this.pool.set(name, elegant)
    const connectConfig:ConnectionConfig = config.connections[name]
    return elegant.connect(connectConfig)
  }
}
