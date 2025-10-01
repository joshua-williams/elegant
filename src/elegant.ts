import * as fs from 'node:fs';
import {Connection, createConnection} from 'mysql2/promise'

abstract class Elegant {
  public connection:Connection;

  protected static pool:ConnectionConfig[] = [];
  protected config:ElegantConfig;

  public abstract connect(config:ConnectionConfig):Promise<Elegant>

  public abstract select<T>(query:string, params?:Scalar[]):Promise<T[]>

  public abstract insert(query:string, params?:Scalar[]):Promise<number>

  public abstract update(query:string, params?:Scalar[]):Promise<number>

  public abstract delete(query:string, params?:Scalar[]):Promise<any>

  public abstract statement(query:string, params?:Scalar[][]):Promise<any>

  public abstract scalar(query:string, params?:Scalar[]):Promise<Scalar>

  public abstract close():Promise<void>

  static connection(name?:string):Promise<Elegant>{
    // todo check if connection is already open
    // todo check if connection is already in pool
    // todo check if connection is in config
    const config = this.getConfiguration()
    name = name ? name : config.default;
    if (!name) throw new Error('No database connection name provided')
    const driver = config.connections[name].driver
    let elegant:Elegant;
    switch (driver) {
      case 'mysql2': elegant = new MySql(); break;
      default: throw new Error(`Unsupported database driver: ${driver}`)
    }
    return elegant.connect(config.connections[name])
  }

  private static getConfiguration():ElegantConfig {
    const configPath = process.cwd() + '/elegant.config.js'
    if (!fs.existsSync(configPath)) throw new Error(`Configuration file not found at ${configPath}`)
    return require(configPath)
  }

}

class MySql extends Elegant {
  async connect(config: ConnectionConfig): Promise<MySql> {
    delete config.driver
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
  }

  async scalar(query: string, params?: any[]): Promise<Scalar> {
    return this.connection.query(query, params)
      .then(results => results[0][0])
  }

  async close(): Promise<void> {
    return this.connection.end();
  }
}


export default Elegant
