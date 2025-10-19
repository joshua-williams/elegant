import ElegantTable from '../lib/schema/ElegantTable.js';
import Elegant from '../index.js';
import {DropTable} from '../lib/schema/DropTable.js';
import {
  DropSchemaClosure, ElegantFunctionClosure,
  ElegantTableAction, SchemaClosure, SchemaOptions
} from '../types.js';
import MysqlTable from '../lib/schema/MysqlTable.js';
import MariaDBTable from '../lib/schema/MariaDBTable.js';
import PostgresTable from '../lib/schema/PostgresTable.js';
import SqliteTable from '../lib/schema/SqliteTable.js';

type SchemaMeta = {
  db:Elegant,
  connection:string,
  tables:ElegantTable[],
  autoExecute:boolean
}

export default class Schema {
  private $:SchemaMeta = {
    db: undefined,
    tables: [],
    connection: undefined,
    autoExecute: true
  }

  constructor( db:Elegant, options?:SchemaOptions) {
    this.$.db = db
    if (options) {
      if (options.autoExecute !== undefined) this.$.autoExecute = options.autoExecute
      if (options.connection) this.$.connection = options.connection
    }
  }


  private makeTable(tableName:string, action:ElegantTableAction) {
    let table:ElegantTable;
    switch(this.$.db.constructor.name.toLowerCase()) {
      case 'mysql': table = new MysqlTable(tableName, action, this.$.db); break;
      case 'mariadb': table = new MariaDBTable(tableName, action, this.$.db); break;
      case "postgres": table = new PostgresTable(tableName, action, this.$.db); break;
      case "sqlite": table = new SqliteTable(tableName, action, this.$.db); break;
    }
    return table;
  }
  /**
   * Creates a new database table using the specified name and schema configuration.
   *
   * @param {string} tableName - The name of the table to be created.
   * @param {SchemaClosure} closure - A closure that defines the schema of the table.
   * @return {Promise<void>} A promise that resolves when the table creation process is completed.
   */
  public async create(tableName:string, closure:SchemaClosure):Promise<any> {
    let table:ElegantTable = this.makeTable(tableName, 'create')

    this.$.tables.push(table)
    closure(table)
    if (this.$.autoExecute) {
      const statement = await table.toStatement()
      await this.$.db.statement(statement)
    }
    return Promise.resolve(true)
  }

  public async fn(name:string, closure:ElegantFunctionClosure) {
    let table:ElegantTable = this.makeTable(name, 'create')
    table.fn(name, closure)
    this.$.tables.push(table)
    if (this.$.autoExecute) {
      const statementMap:Map<string,string[]> = (table as any).statements
      const connection = table.constructor.name.toLowerCase().replace('table', '')
      const [statement] = statementMap.get(connection)
      await this.$.db.query(statement)
    }
  }

  public async dropFn(name:string, closure?:ElegantFunctionClosure) {
    let table:ElegantTable = this.makeTable(name, 'drop')
    table.fn(name, closure)
    this.tables.push(table)
    if (this.$.autoExecute) {
      const statementMap:Map<string,string[]> = (table as any).statements
      const connection = table.constructor.name.toLowerCase().replace('table', '')
      const [statement] = statementMap.get(connection)
      await this.$.db.query(statement)
    }
  }

  /**
   * Drops a specified table from the database, optionally allowing additional schema configuration through a closure
   * and specifying the SQL dialect to be used.
   *
   * @param {string} tableName - The name of the table to be dropped.
   * @param {DropSchemaClosure} [closure] - An optional closure (callback) to configure the drop table operation.
   * @param {SchemaDialect} [dialect='mysql'] - The SQL dialect to be used, defaulting to 'mysql'.
   * @return {Promise<void>} A Promise that resolves when the drop operation is complete.
   */
  public async drop(tableName:string, closure?:DropSchemaClosure):Promise<void> {
    const dropTable:DropTable = new DropTable(tableName, 'drop', this.$.db)
    if (closure) closure(dropTable)
    this.$.tables.push(dropTable)
    if(this.$.autoExecute) {
      await this.$.db.query(await dropTable.toStatement())
    }
  }

  /**
   * Retrieves the schema based on the specified dialect or the default configuration.
   *
   * @param {SchemaDialect} dialect - The database dialect used to determine the schema.
   * @return {string} The schema configuration, or a dialect-specific schema resolution.
   */
  private getSchema():any {
    switch(this.$.db.constructor.name.toLowerCase()) {
      case 'postgres': return 'current_schema()'
    }
  }

  /**
   * Retrieves a list of table names from the database.
   *
   * @param {string} [schema] - The schema from which to list the tables. If not provided, the default schema will be used based on the database dialect.
   * @return {Promise<string[]>} - A promise that resolves to an array of table names as strings.
   */
  public async listTables(schema?:string):Promise<string[]> {
    const query = () => {
      switch(this.$.db.constructor.name.toLowerCase()) {
        case 'postgres':
          return `SELECT table_name FROM information_schema.tables WHERE table_schema = ${schema || this.getSchema()} AND table_type = 'BASE TABLE';
          `;
        default: return `SHOW TABLES`
      }
    }
    const tables = await this.$.db.query(query())
    return tables.map(table => Object.values(table)[0])
  }

  /**
   * Retrieves the list of tables in queue for creation.
   *
   * @return {ElegantTable[]} An array of ElegantTable objects.
   */
  get tables():ElegantTable[] {
    return this.$.tables
  }

  private enclosure(name:string) {
    switch(name.toLowerCase()) {
      case 'mysql':
      case 'mariadb': return '`'
      default: return '"'
    }
  }

  disconnect() {
    return this.$.db.disconnect()
  }
}
