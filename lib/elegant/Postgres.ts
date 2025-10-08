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
}
