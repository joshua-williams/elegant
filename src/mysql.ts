import {createConnection} from 'mysql2/promise';
import Elegant from './elegant';

class MySql extends Elegant {
  async connect(config: ConnectionConfig): Promise<MySql> {
    delete config.dialect
    this.connection = await createConnection(config)
    return this;
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
  async statement(query: string, params?: Scalar[][]): Promise<any> {
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

  async scalar(query: string, params?: any[]): Promise<Scalar> {
    return this.connection.query(query, params)
      .then(results => Object.values(results[0][0])[0] as Scalar)
  }

  async close(): Promise<void> {
    return this.connection.end();
  }
}

export default MySql
