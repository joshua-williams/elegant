import QueryBuilder from './QueryBuilder.js';
import path from 'node:path';
import { Scalar, ConnectionConfig} from '../types.js';
import {getAppConfig} from '../lib/config.js';
import { fileURLToPath } from 'url';
import ElegantQueryBuilder from '../lib/elegant/ElegantQueryBuilder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Represents an abstract database handler providing methods for establishing connections,
 * querying databases, and managing transactions. The `Elegant` class should be extended
 * by concrete implementations for specific database dialects.
 *
 * This class includes various abstract methods for database operations, which must be
 * implemented by derived classes.
 */
export default abstract class Elegant{
  private static pool: {[key:string]:Elegant} = {}
  public connection:any;
  protected config:ConnectionConfig;


  /**
   * Establishes a connection using the specified configuration.
   *
   * @param {ConnectionConfig} config - The configuration object required to establish the connection.
   * @return {Promise<Elegant>} A promise that resolves with the current instance upon successful connection.
   */
  public connect(config:ConnectionConfig):Promise<Elegant> {
    this.config = config
    return Promise.resolve(this)
  }

  /**
   * Starts a new transaction.
   * @return {Promise<void>} A Promise that resolves when the transaction is started.
   * @throws {Error} If the transaction could not be started.
   */
  public abstract beginTransaction():Promise<any>

  /**
   * Commits the current transaction.
   * @return {Promise<void>} A Promise that resolves when the transaction is committed.
   * @throws {Error} If the transaction could not be committed.
   */
  public abstract commit():Promise<any>

  /**
   * Rolls back the current transaction.
   * @return {Promise<void>} A Promise that resolves when the transaction is rolled back.
   * @throws {Error} If the transaction could not be rolled back.
   */
  public abstract rollback():Promise<any>

  /**
   * Executes a transaction using the provided callback function, which is supplied with a database instance.
   * Transactions ensure that either all operations within the callback are committed or none are, maintaining data consistency.
   *
   * @param {function(db: Elegant): void} callback - A function that receives the database instance to perform operations within the transaction context.
   * @return {Promise<void>} A promise that resolves if the transaction is successfully committed, or rejects if an error occurs or the transaction is rolled back.
   */
  public abstract transaction(callback:(db:Elegant) => void):Promise<void>

  /**
   * Executes a database select query and returns the results as an array of the specified type.
   *
   * @param {string} query - The SQL query string to execute.
   * @param {any[]} [params] - Optional array of parameters to bind to the query.
   * @return {Promise<T[]>} A promise that resolves to an array of results of the specified type.
   * @throws {Error} If the select operation fails.
   */
  public abstract select<T>(query:string, params?:Scalar[]):Promise<T[]>

  /**
   * Executes a database query with the provided SQL string and optional parameters.
   *
   * @param {string} query - The SQL query string to be executed.
   * @param {Scalar[]} [params] - An optional array of parameters to be substituted into the query.
   * @return {Promise<T[]>} A promise that resolves to an array of results of type T.
   */
  public abstract query<T>(query:string, params?:Scalar[]):Promise<T[]>

  /**
   * Executes a scalar query and returns a single value or a Scalar instance.
   *
   * @param {string} query The SQL query string to execute.
   * @param {Scalar[]} [params] Optional parameters to bind to the query.
   * @return {Promise<T | Scalar>} A promise that resolves to a single value of type T or a Scalar instance.
   */
  public abstract scalar<T>(query:string, params?:Scalar[]):Promise<T|Scalar>

  /**
   * Executes an insert operation using the provided SQL query and optional parameters.
   *
   * @param {string} query - The SQL query string to execute.
   * @param {any[]} [params] - Optional array of parameters to bind to the query.
   * @return {Promise<number>} A promise that resolves to the number of affected rows.
   * @throws {Error} If the insert operation fails.
   */
  public abstract insert(query:string, params?:Scalar[]):Promise<number>

  /**
   * Executes an update operation using the provided SQL query and optional parameters.
   *
   * @param {string} query - The SQL query string to execute.
   * @param {Scalar[]} [params] - Optional array of parameters to bind to the query.
   * @return {Promise<number>} A promise that resolves to the number of affected rows.
   * @throws {Error} If the update operation fails.
   */
  public abstract update(query:string, params?:Scalar[]):Promise<number>

  /**
   * Executes a delete operation using the provided SQL query and optional parameters.
   *
   * @param {string} query - The SQL query string to execute.
   * @param {any[]} [params] - Optional array of parameters to bind to the query.
   * @return {Promise<number>} A promise that resolves to the number of affected rows.
   * @throws {Error} If the delete operation fails.
   */
  public abstract delete(query:string, params?:Scalar[]):Promise<any>

  /**
   * Executes a prepared SQL statement with the given query and parameters.
   * Prepares the SQL query on the database connection and executes it with the provided parameters.
   *
   * @param {string} query - The SQL query to be executed.
   * @param {Scalar[]} [params=[]] - An optional array of parameters to be used in the SQL statement.
   * @return {Promise<any>} A promise that resolves when the statement is executed.
   */
  public abstract statement(query:string, params?:Scalar[]):Promise<any>

  /**
   * Closes the database connection.
   * @return {Promise<void>} A promise that resolves when the connection is closed.
   * @throws {Error} If the connection could not be closed.
   */
  public abstract disconnect():Promise<void>

  /**
   * Sets the table for the query builder to operate on.
   *
   * @param tableName The name of the table to be used in the query.
   * @return The query builder instance configured with the specified table.
   */
  table(tableName:string):ElegantQueryBuilder {
    const qb = new ElegantQueryBuilder(this);
    return qb.table(tableName)
  }


  /**
   * Establishes and configures a database connection based on the provided name or the default connection.
   *
   * @param {string} [name] - The name of the desired database connection. If omitted, the default connection is used.
   * @return {Promise<Elegant>} A promise that resolves to an instance of the configured Elegant database connection.
   * @throws {Error} If no database connections are configured, if no connection name is provided, or if an unsupported database driver is specified.
   */
  static async connection(name?:string):Promise<Elegant>{
    // get elegant configuration
    const config = await getAppConfig()
    // check if config has connections configured
    if (!config.connections) throw new Error('No database connections configured')
    // if no connection name is provided, use the default connection
    name = name ? name : config.default;
    // check if the connection name is valid
    if (!name) throw new Error('No database connection name provided')
    const connectionConfig = config.connections[name]
    const dialect = connectionConfig.dialect
    let elegant:Elegant;
    switch (dialect) {
      case 'mariadb':
        const MariaDb = ( await import(path.resolve(__filename, '../../lib/elegant/MariaDB.js'))).default;
        elegant = new MariaDb();
        break;
      case 'mysql':
        const MySql = ( await import(path.resolve(__filename, '../../lib/elegant/Mysql.js'))).default;
        elegant = new MySql();
        break;
      case 'postgres':
        const Postgres = ( await import(path.resolve(__filename, '../../lib/elegant/Postgres.js'))).default;
        elegant = new Postgres();
        break
      case 'sqlite':
        const Sqlite = ( await import(path.resolve(__filename, '../../lib/elegant/Sqlite.js'))).default;
        elegant = new Sqlite();
        break;
      default:
        throw new Error(`Unsupported database driver: ${dialect}`)
    }
    return elegant.connect(connectionConfig)
  }


  /**
   * Returns a singleton instance of a database connection. If no name is provided, it uses the default database connection.
   *
   * @param {string} [name] - The name of the database connection to retrieve. If not provided, the default name is used.
   * @return {Promise<object>} - A promise that resolves to the database connection instance.
   */
  public static async singleton(name?:string) {
    if (!name) {
      const config = await getAppConfig()
      if (! config.default) throw new Error('No default database connection configured')
      name = config.default
    }
    if (this.pool[name]) return this.pool[name]
    const db = await Elegant.connection(name)
    this.pool[name] = db
    return db
  }


  /**
   * Disconnects the specified database connection by name or all active connections if no name is provided.
   *
   * @param {string} [name] - Optional name of the specific database connection to disconnect. If not provided, all connections will be disconnected.
   * @return {Promise<any>} A promise that resolves when the disconnection(s) are complete.
   * @throws {Error} If the specified database connection name does not exist.
   */
  public static async disconnect(name?:string):Promise<any> {
    if (name) {
      if ( ! this.pool[name] ) throw new Error(`No database connection name provided for ${name}`)
      return this.pool[name].disconnect()
    } else {
      for (const db of Object.values(this.pool)) {
        await db.disconnect()
      }
    }
  }
}
