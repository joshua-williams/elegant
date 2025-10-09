import pg from 'pg'
const { Client } = pg
import Elegant from '../../src/Elegant';
import {Scalar, ConnectionConfig} from '../../types';
import { QueryResult } from 'pg';

export default class Postgres extends Elegant {
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
      throw new Error('Method not implemented.');
  }
  public insert(query: string, params?: Scalar[]): Promise<number> {
      throw new Error('Method not implemented.');
  }
  public update(query: string, params?: Scalar[]): Promise<number> {
      throw new Error('Method not implemented.');
  }
  public delete(query: string, params?: Scalar[]): Promise<any> {
      throw new Error('Method not implemented.');
  }
  public statement(query: string, params?: Scalar[]): Promise<any> {
      throw new Error('Method not implemented.');
  }
  public statements(query: string, params?: Scalar[][]): Promise<any> {
      throw new Error('Method not implemented.');
  }
  public scalar(query: string, params?: Scalar[]): Promise<Scalar> {
    return this.connection.query(query, params)
      .then((result:QueryResult) => Object.values(result.rows[0])[0] as Scalar )
  }

  async query<T>(query: string, params?: any[]): Promise<T> {
    return this.connection.query(query, params)
      .then((result:QueryResult) => result.rows )
  }
  close(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async connect(config?: ConnectionConfig): Promise<Elegant> {
    let _config:any = config;
    if (config.schema) {
      const schema = config.schema
      delete config.schema
      _config = {...config, options: `--search_path=${schema},public`}
    }
    this.connection = new Client(_config)
    await this.connection.connect()
    return this
  }
}
