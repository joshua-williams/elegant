import pg from 'pg'
const { Pool, Client } = pg
import Elegant from '../../src/Elegant';
import {Scalar, ConnectionConfig} from '../../types';
import Mysql from './Mysql';

export default class Postgres extends Mysql {
  close(): Promise<void> {
    return Promise.resolve(undefined);
  }

  async connect(config: ConnectionConfig): Promise<Elegant> {
    this.connection = new Pool(config)
    await this.connection.connect()
    return this
  }
  //
  // delete(query: string, params?: Scalar[]): Promise<any> {
  //   return Promise.resolve(undefined);
  // }
  //
  // insert(query: string, params?: Scalar[]): Promise<number> {
  //   return Promise.resolve(0);
  // }
  //
  // query(query: string, params?: Scalar[]): Promise<any> {
  //   return Promise.resolve(undefined);
  // }
  //
  // scalar(query: string, params?: Scalar[]): Promise<Scalar> {
  //   return Promise.resolve(undefined);
  // }
  //
  // select<T>(query: string, params?: Scalar[]): Promise<T[]> {
  //   return Promise.resolve([]);
  // }
  //
  // statement(query: string, params?: Scalar[][]): Promise<any> {
  //   return Promise.resolve(undefined);
  // }
  //
  // transaction(callback: (db: Elegant) => void): Promise<void> {
  //   return Promise.resolve(undefined);
  // }
  //
  // update(query: string, params?: Scalar[]): Promise<number> {
  //   return Promise.resolve(0);
  // }

}
