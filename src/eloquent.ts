import * as fs from 'node:fs';
import {Connection, createConnection} from 'mysql2/promise'

abstract class Eloquent {
  public connection:Connection;

  protected static pool:ConnectionConfig[] = [];
  protected config:EloquentConfig;

  public abstract connect(config:ConnectionConfig):Promise<Eloquent>

  static connection(name?:string):Promise<Eloquent>{
    // todo check if connection is already open
    // todo check if connection is already in pool
    // todo check if connection is in config
    const config = this.getConfiguration()
    name = name ? name : config.default;
    if (!name) throw new Error('No database connection name provided')
    const driver = config.connections[name].driver
    let eloquent:Eloquent;
    switch (driver) {
      case 'mysql2': eloquent = new MySql(); break;
      default: throw new Error(`Unsupported database driver: ${driver}`)
    }
    return eloquent.connect(config.connections[name])
  }

  private static getConfiguration():EloquentConfig {
    const configPath = process.cwd() + '/eloquent.config.js'
    if (!fs.existsSync(configPath)) throw new Error(`Configuration file not found at ${configPath}`)
    return require(configPath)
  }

}

class MySql extends Eloquent {
  async connect(config: ConnectionConfig): Promise<MySql> {
    delete config.driver
    this.connection = await createConnection(config)
    return this;
  }
}


export default Eloquent
