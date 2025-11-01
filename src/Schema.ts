import ElegantTable from '../lib/schema/ElegantTable.js';
import Elegant from '../index.js';
import {
  ElegantFunctionClosure, ElegantTableAction,
  SchemaClosure, SchemaOptions
} from '../types.js';
import MysqlTable from '../lib/schema/MysqlTable.js';
import MariaDBTable from '../lib/schema/MariaDBTable.js';
import PostgresTable from '../lib/schema/PostgresTable.js';
import SqliteTable from '../lib/schema/SqliteTable.js';

type SchemaMeta = {
  db:Elegant,
  connection:string,
  tables:ElegantTable[],
  autoExecute:boolean,
  executePromises:Promise<any>[]
}

export default class Schema {
  $:SchemaMeta = {
    db: undefined,
    tables: [],
    connection: undefined,
    autoExecute: true,
    executePromises: []
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
   * Creates a new table with the specified name and schema closure.
   * The table is added to the internal tables collection and optionally executed immediately
   * if auto-execute is enabled.
   *
   * @param {string} tableName - The name of the table to be created.
   * @param {SchemaClosure} closure - A callback function defining the table schema.
   * @return {void} Does not return a value.
   */
  public createTable(tableName:string, closure:SchemaClosure):void {
    let table:ElegantTable = this.makeTable(tableName, 'create')

    this.$.tables.push(table)
    try {
      closure(table)
    } catch (e) {
      throw new Error(`Cannot create schema table: ${tableName}. ${e.message}`)
    }
    if (this.$.autoExecute) {
      const statement = table.toStatement()
      this.$.executePromises.push(this.$.db.statement(statement))
    }
  }

  /**
   * Creates and manages a new table with the specified name and schema.
   * The table is passed to the provided closure for further customization.
   * If auto-execute is enabled, the table creation is executed immediately.
   *
   * @param {string} tableName The name of the table to be created.
   * @param {SchemaClosure} closure A function that defines the schema of the table using the provided table object.
   * @return {Promise<void>} A promise that resolves when the table creation process is complete.
   */
  public table(tableName:string, closure:SchemaClosure) {
    let table:ElegantTable = this.makeTable(tableName, 'create')
    this.tables.push(table)
    closure(table)
    if (this.$.autoExecute) {
      const statement = table.toStatement()
      this.$.executePromises.push(this.$.db.statement(statement))
    }
  }

  public async alterTable(tableName:string, closure:SchemaClosure) {
    let table:ElegantTable = this.makeTable(tableName, 'alter')
    this.tables.push(table)
    closure(table)
    if (this.$.autoExecute) {
      const statement = await this.$.db.statement(tableName)
      await this.$.db.statement(statement)
    }
  }

  /**
   * Registers a table with a given name and function closure, then optionally executes it if auto-execute is enabled.
   *
   * @param {string} name - The name of the table to be created and registered.
   * @param {ElegantFunctionClosure} closure - The function closure applied to the table for configuration or definition.
   * @return {Promise<void>} Resolves when the table is registered and/or the query is executed, if applicable.
   */
  public async function(name:string, closure:ElegantFunctionClosure) {
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

  /**
   * Executes the dropping of a table function, optionally with additional closure logic.
   *
   * @param {string} name - The name of the table function to be dropped.
   * @param {ElegantFunctionClosure} [closure] - Optional closure logic to define additional behavior for the drop operation.
   * @return {Promise<void>} A promise that resolves once the drop operation has completed.
   */
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
  public dropTable(tableName:string, closure?:SchemaClosure):void {
    const table:ElegantTable = this.makeTable(tableName, 'drop')
    if (closure) closure(table)
    this.$.tables.push(table)
    if(this.$.autoExecute) {
      const statement = table.toStatement()
      this.$.executePromises.push(this.$.db.statement(statement))
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

  toStatement():string {
    const statements:string[] = []
    for (const table of this.$.tables) {
      statements.push(table.toStatement())
    }
    return statements.join('\n\n')
  }
  reset() {
    this.$.tables = []
  }
}
