import pg from 'pg'
const { Client, types } = pg
import Elegant from '../../src/Elegant';
import {Scalar, ConnectionConfig} from '../../types';
import { QueryResult } from 'pg';

types.setTypeParser(types.builtins.INT8, function(val) {
  return parseInt(val, 10)
})

export default class Postgres extends Elegant {

  async connect(connectionConfig?: ConnectionConfig): Promise<Elegant> {
    const config:any = {...connectionConfig}
    if (config.schema) {
      config.options = `--search_path=${config.schema},public`
      delete config.schema
    }
    this.connection = new Client(config)
    await this.connection.connect()
    return this
  }

  public beginTransaction(): Promise<any> {
    return this.connection.query('BEGIN')
  }

  public commit(): Promise<any> {
    return this.connection.query('COMMIT')
  }

  public rollback(): Promise<any> {
    return this.connection.query('ROLLBACK')
  }

  public async transaction(callback: (db: Elegant) => void|Promise<any>): Promise<void> {
    await this.connection.query('BEGIN')
    try {
      await callback(this)
      await this.connection.query('COMMIT')
    } catch (error) {
      await this.connection.query('ROLLBACK')
      throw error
    }
  }
  public select<T>(query: string, params?: Scalar[]): Promise<T[]> {
    return this.connection.query(query, params)
      .then((res:any) => res.rows)
  }

  async query<T>(query: string, params?: any[]): Promise<T> {
    return this.connection.query(query, params)
      .then((result:QueryResult) => result.rows )
  }

  public scalar<T>(query: string, params?: Scalar[]): Promise<T> {
    return this.connection.query(query, params)
      .then((result:QueryResult) => Object.values(result.rows[0])[0] as T )
  }

  public insert(query: string, params?: Scalar[]): Promise<number> {
    return this.connection.query(query, params)
      .then((res:any) => res.rowCount)
  }
  public update(query: string, params?: Scalar[]): Promise<number> {
      return this.connection.query(query, params)
        .then((res:any) => res.rowCount)
  }

  public delete(query: string, params?: Scalar[]): Promise<number> {
    return this.connection.query(query, params)
      .then((res:any) => res.rowCount)
  }

  public statement(query: string, params?: Scalar[]): Promise<void> {
    return this.connection.query(query, params)
      .then(() => {})
  }

  public statements(query: string, params?: Scalar[][]): Promise<any> {
      throw new Error('Method not implemented.');
  }

  close(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
