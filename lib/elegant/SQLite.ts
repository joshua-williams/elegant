import {ConnectionConfig, Scalar} from '../../types.js';
import {Database} from 'sqlite3';
import Elegant from '../../src/Elegant.js';
import {appPath} from '../util.js';

export default class SQLite extends Elegant {
  declare connection:Database;

  async connect(config:ConnectionConfig) {
    this.connection = new Database(appPath(config.database))
    return this
  }

  public select<T>(query: string, params?: Scalar[]): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.connection.all(query, params, (err, rows:any) => {
        if (err) reject(err)
        resolve(rows)
      })
    })
  }

  public query<T>(query: string, params?: Scalar[]): Promise<T[]> {
    return this.select(query, params)
  }
  public scalar<T>(query: string, params?: Scalar[]): Promise<T | Scalar> {
    return this.select(query, params)
      .then((rows:T[]) => Object.values(rows[0])[0] as T)
  }
  public insert(query: string, params?: Scalar[]): Promise<number> {
    return new Promise((resolve, reject) => {
      this.connection.run(query, params, function(err) {
        if (err) return reject(err)
        resolve(this.lastID)
      })
    })
  }

  public update(query: string, params?: Scalar[]): Promise<number> {
    const statement:any = this.connection.prepare(query)
    return new Promise((resolve, reject) => {
      statement.run(params, function(err)  {
        if (err) {
          this.finalize(() => reject(err))
          return;
        }
        const changes = this.changes
        statement.finalize(() => resolve(changes))
      })
    })
  }
  public delete(query: string, params?: Scalar[]): Promise<number> {
    return new Promise((resolve, reject) => {
      this.connection.run(query, params, function(err) {
        if (err) this.finalize(() => reject(err))
        resolve(this.changes)
      })
    })
  }
  public statement(query: string, params?: Scalar[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.run(query, params, function(err) {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  public disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.close((err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  public beginTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.run('BEGIN TRANSACTION', (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
  public commit(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.run('COMMIT', (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
  public rollback(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.connection.run('ROLLBACK', (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
  public async transaction(callback: (db: Elegant) => void|Promise<void>): Promise<void> {
    await this.beginTransaction()
    try {
      await callback(this)
      await this.commit()
    } catch (error) {
      await this.rollback()
      throw error
    }
  }

}
