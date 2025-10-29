import {createConnection} from 'mysql2/promise';
import Elegant from '../../src/Elegant.js';
import {Scalar, ConnectionConfig} from '../../types.js';

/**
 * This class extends the Elegant ORM to provide a simplified interface for interacting with a MySQL database.
 * It includes methods for executing various SQL operations such as queries, transactions, and prepared statements.
 * This class is designed to handle common tasks for database communication in a streamlined manner.
 */
export default class Mysql extends Elegant {
  /**
   * Starts a new transaction.
   * @return {Promise<void>} A Promise that resolves when the transaction is started.
   * @throws {Error} If the transaction could not be started.
   */
  public beginTransaction(): Promise<void> {
    return this.connection.beginTransaction()
  }

  /**
   * Commits the current transaction.
   * @return {Promise<void>} A Promise that resolves when the transaction is committed.
   * @throws {Error} If the transaction could not be committed.
   */
  public commit(): Promise<void> {
    return this.connection.commit()
  }

  /**
   * Rolls back the current transaction.
   * @return {Promise<void>} A Promise that resolves when the transaction is rolled back.
   * @throws {Error} If the transaction could not be rolled back.
   */
  public rollback(): Promise<void> {
    return this.connection.rollback()
  }

  /**
   * Connects to the database using the provided connection configuration.
   * @return {Promise<Elegant>} A Promise that resolves to an instance of Elegant.
   * @param connectConfig
   * @throws {Error} If the connection fails.
   */
  async connect(connectConfig: ConnectionConfig): Promise<Elegant> {
    const config = {...connectConfig, multipleStatements:true}
    delete config.dialect
    this.connection = await createConnection(config)
    return this as unknown as Elegant
  }

  /**
   * Executes a database select query and returns the results as an array of the specified type.
   *
   * @param {string} query - The SQL query string to execute.
   * @param {any[]} [params] - Optional array of parameters to bind to the query.
   * @return {Promise<T[]>} A promise that resolves to an array of results of the specified type.
   * @throws {Error} If the select operation fails.
   */
  async select<T>(query: string, params?: any[]): Promise<T[]> {
    return this.connection.query(query, params)
      .then( results => results[0] as T[])
  }

  /**
   * Executes an insert operation using the provided SQL query and optional parameters.
   *
   * @param {string} query - The SQL query string to execute.
   * @param {any[]} [params] - Optional array of parameters to bind to the query.
   * @return {Promise<number>} A promise that resolves to the number of affected rows.
   * @throws {Error} If the insert operation fails.
   */
  async insert(query: string, params?: any[]): Promise<number> {
    return this.connection.query(query, params)
      .then((results:any) => results[0].affectedRows as number)

  }

  /**
   * Executes an update operation using the provided SQL query and optional parameters.
   *
   * @param {string} query - The SQL query string to execute.
   * @param {Scalar[]} [params] - Optional array of parameters to bind to the query.
   * @return {Promise<number>} A promise that resolves to the number of affected rows.
   * @throws {Error} If the update operation fails.
   */
  async update(query: string, params?:Scalar[]): Promise<number> {
    return this.connection.query(query, params)
      .then((results:any) => results[0].affectedRows as number)
  }

  /**
   * Executes a delete operation using the provided SQL query and optional parameters.
   *
   * @param {string} query - The SQL query string to execute.
   * @param {any[]} [params] - Optional array of parameters to bind to the query.
   * @return {Promise<number>} A promise that resolves to the number of affected rows.
   * @throws {Error} If the delete operation fails.
   */
  async delete(query: string, params?: any[]): Promise<number> {
    return this.connection.query(query, params)
      .then((results:any) => results[0].affectedRows as number)
  }

  /**
   * Executes a prepared SQL statement with the given query and parameters.
   * Prepares the SQL query on the database connection and executes it with the provided parameters.
   *
   * @param {string} query - The SQL query to be executed.
   * @param {Scalar[]} [params=[]] - An optional array of parameters to be used in the SQL statement.
   * @return {Promise<any>} A promise that resolves when the statement is executed.
   */
  async statement(query: string, params: Scalar[] = []): Promise<any> {
    const statement = await this.connection.prepare(query)
    await statement.execute(params)
  }

  /**
   *
   * Executes a prepared SQL statement with the given query and parameters.
   * Processes each parameter set and returns the results as a list of objects
   * where each object's keys correspond to the columns returned by the query.
   *
   * @param {string} query - The SQL query to be executed.
   * @param {Scalar[][]} [params=[]] - A list of parameter sets to be bound to the SQL query.
   * Each parameter set corresponds to a single execution of the query.
   * @return {Promise<any>} A Promise that resolves to an array of objects containing the results of the query execution.
   */
  async statements(query: string, params: Scalar[][] = []): Promise<any> {
    const statement = await this.connection.prepare(query)
    const promises:Promise<any>[] = []
    for (const param of params) {
      const promise = statement.execute(param)
        .then(results => {
          const keys = Object.keys(results[0])
          const reducer = (acc:Record<string,Scalar>, key:any) => {
            acc[key] = results[0][key]
            return acc
          }
          return keys.reduce(reducer, {})
        })
      promises.push(promise)
    }
    return Promise.all(promises)
  }

  /**
   * Executes a raw SQL query with the given parameters.
   * @param {string} query - The SQL query to be executed.
   * @param {any[]} [params=[]] - An array of parameters to be bound to the query.
   * @return {Promise<any>} A Promise that resolves to the result of the query execution.
   * @throws {Error} If the query execution fails.
   */
  async query(query: string, params?: any[]): Promise<any> {
    return this.connection.query(query, params)
      .then((results) => results[0])
  }

  /**
   * Executes a SQL query and returns the first scalar value from the result.
   *
   * @param {string} query - The SQL query to execute.
   * @param {any[]} [params] - An optional array of parameters to bind to the query.
   * @return {Promise<Scalar>} A promise that resolves to the first scalar value found in the query result.
   */
  async scalar(query: string, params?: any[]): Promise<Scalar> {
    return this.connection.query(query, params)
      .then(results => Object.values(results[0][0])[0] as Scalar)
  }

  /**
   * Executes a transactional operation. The provided callback function is called with the current database connection.
   * The transaction is automatically committed if the callback executes successfully, or rolled back in case of an error.
   *
   * @param {function(connection: Elegant): void} callback - A function that contains the operations to be executed within the transaction.
   *                                                         Receives a connection object as its argument.
   * @return {Promise<void>} A promise that resolves when the transaction completes successfully, or rejects if an error occurs.
   */
  async transaction(callback: (connection: Elegant) => void): Promise<void> {
    await this.connection.beginTransaction()
    try {
      await callback(this)
      await this.connection.commit()
    } catch (error) {
      await this.connection.rollback()
      throw error
    }
  }

  /**
   * Closes the database connection.
   * @return {Promise<void>} A promise that resolves when the connection is closed.
   * @throws {Error} If the connection could not be closed.
   */
  async disconnect(): Promise<void> {
    return this.connection.end();
  }
}
