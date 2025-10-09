import ElegantTable from '../../lib/schema/ElegantTable';
import Elegant from '../../index';
import {DropTable} from '../../lib/schema/DropTable';
import {DropSchemaClosure, ElegantConfig, SchemaClosure, SchemaDialect} from '../../types';
import MysqlTable from '../../lib/schema/MysqlTable';
import MariaDBTable from '../../lib/schema/MariaDBTable';
import PostgresTable from '../../lib/schema/PostgresTable';
import { ConnectionConfig } from '../../types'

type SchemaMeta = {
  config:ElegantConfig,
  connection:string,
  tables:ElegantTable[],
  autoExecute:boolean
}

export default class Schema {
  private $:SchemaMeta = {
    config: undefined,
    tables: [],
    connection: undefined,
    autoExecute: true
  }

  constructor( config:ElegantConfig) {
    this.$.config = config
  }

  public connection(name:string) {
    this.$.connection = name
    return this
  }

  public async create(tableName:string, closure:SchemaClosure, dialect:SchemaDialect='mysql'):Promise<void> {
    const connection = this.$.connection ||  this.$.config.default;
    const config:ConnectionConfig = this.$.config.connections[connection]
    let table:ElegantTable;
    switch(config.dialect) {
      case 'mysql': table = new MysqlTable(tableName, 'create', "`"); break;
      case 'mariadb': table = new MariaDBTable(tableName, 'create', "`"); break;
      case "postgres": table = new PostgresTable(tableName, 'create', '"'); break;
    }
    this.$.tables.push(table)
    closure(table)
    if (this.$.autoExecute) {
      const db = await Elegant.connection(this.$.connection)
      await db.query(table.toStatement())
      await db.close()
    }
  }

  public async drop(tableName:string, closure?:DropSchemaClosure, dialect:SchemaDialect='mysql'):Promise<void> {
    const connection = this.$.connection ||  this.$.config.default;
    const config:ConnectionConfig = this.$.config.connections[connection]

    const dropTable:DropTable = new DropTable(tableName, 'drop', this.enclosure(config.dialect) )
    if (closure) closure(dropTable)
    this.$.tables.push(dropTable)
    if(this.$.autoExecute) {
      const db = await Elegant.connection(this.$.connection)
      await db.query(dropTable.toStatement())
      await db.close()
    }
  }

  /**
   * Retrieves the schema based on the specified dialect or the default configuration.
   *
   * @param {SchemaDialect} dialect - The database dialect used to determine the schema.
   * @return {string} The schema configuration, or a dialect-specific schema resolution.
   */
  private getSchema(dialect:SchemaDialect):any {
    const connection = this.$.connection ||  this.$.config.default;
    const config:ConnectionConfig = this.$.config.connections[connection]
    if (config.schema) return config.schema
    switch(dialect) {
      case 'postgres': return 'current_schema()'
    }
  }
  public async listTables(schema?:string):Promise<string[]> {
    const db = await Elegant.connection(this.$.connection)
    const connection = this.$.connection ||  this.$.config.default;
    const config:ConnectionConfig = this.$.config.connections[connection]
    const query = () => {
      switch(config.dialect) {
        case 'postgres':
          return `SELECT table_name FROM information_schema.tables WHERE table_schema = ${schema || this.getSchema('postgres')} AND table_type = 'BASE TABLE';
          `;
        default: return `SHOW TABLES`
      }
    }
    const tables = await db.query(query())
    await db.close()
    return tables.map(table => Object.values(table)[0])
  }

  get tables():ElegantTable[] {
    return this.$.tables
  }
  get config():ElegantConfig {
    return this.$.config
  }

  private enclosure(name:string) {
    switch(name.toLowerCase()) {
      case 'mysql':
      case 'mariadb': return '`'
      default: return '"'
    }
  }

}
