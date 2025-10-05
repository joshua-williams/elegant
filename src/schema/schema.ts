import SchemaTable from './schema-table';
import Elegant, {Migration} from '../../index';
import {DropSchemaTable} from './drop-schema-table';

type SchemaMeta = {
  config:ElegantConfig,
  connection:string,
  tables:SchemaTable[]
}
type SchemaClosure = (table:SchemaTable) => void;
type DropSchemaClosure = (table:DropSchemaTable) => void;

export default class Schema {
  private $:SchemaMeta = {
    config: undefined,
    tables: [],
    connection: undefined
  }

  constructor( config:ElegantConfig) {
    this.$.config = config
  }

  public connection(name:string) {
    this.$.connection = name
    return this
  }

  public create(tableName:string, closure:SchemaClosure):void {
    const table = new SchemaTable(tableName)
    this.$.tables.push(table)
    closure(table)
  }

  public drop(tableName:string, closure:DropSchemaClosure):void {
    const dropTable:DropSchemaTable = new DropSchemaTable(tableName)
    closure(dropTable)
    this.$.tables.push(dropTable)
  }

  public async getTables():Promise<string[]> {
    const db = await Elegant.connection(this.$.connection)

    const tables = await db.query(`SHOW TABLES`)
    return tables.map(table => table)
  }

  get tables():SchemaTable[] {
    return this.$.tables
  }
  get config():ElegantConfig {
    return this.$.config
  }
}
