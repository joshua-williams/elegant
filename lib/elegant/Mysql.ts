import {createConnection} from 'mysql2/promise';
import Elegant from '../../src/Elegant';
import {Scalar, ConnectionConfig} from '../../types';

export default class Mysql extends Elegant {
  public beginTransaction(): Promise<void> {
    return this.connection.beginTransaction()
  }
  public commit(): Promise<void> {
    return this.connection.commit()
  }
  public rollback(): Promise<void> {
    return this.connection.rollback()
  }
  async connect(config: ConnectionConfig): Promise<Elegant> {
    delete config.dialect
    this.connection = await createConnection(config)
    return this
  }

  async select<T>(query: string, params?: any[]): Promise<T[]> {
    return this.connection.query(query, params)
      .then( results => results[0] as T[])
  }

  async insert(query: string, params?: any[]): Promise<number> {
    return this.connection.query(query, params)
      // @ts-ignore
      .then(results => results[0].affectedRows)

  }

  async update(query: string, params?:Scalar[]): Promise<number> {
    return this.connection.query(query, params)
      // @ts-ignore
      .then(results => results[0].affectedRows)
  }

  async delete(query: string, params?: any[]): Promise<number> {
    return this.connection.query(query, params)
      // @ts-ignore
      .then(results => results[0].affectedRows)
  }

  async statement(query: string, params: Scalar[] = []): Promise<any> {
    const statement = await this.connection.prepare(query)
    const promises:Promise<any>[] = []
    for (const param of params) {
      const promise = statement.execute(param)
        .then(results => results[0][0])
      promises.push(promise)
    }
    return Promise.all(promises)
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
          const reducer = (acc:Record<string,Scalar>, key:any, i:number) => {
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
  }

  async scalar(query: string, params?: any[]): Promise<Scalar> {
    return this.connection.query(query, params)
      .then(results => Object.values(results[0][0])[0] as Scalar)
  }

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

  async close(): Promise<void> {
    return this.connection.end();
  }
}
