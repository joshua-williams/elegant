import SchemaTable from '../../lib/schema/SchemaTable';
import Elegant from '../../index';
import {DropSchemaTable} from '../../lib/schema/DropSchemaTable';
import {DropSchemaClosure, ElegantConfig, SchemaClosure, SchemaDialect} from '../../types';
import MysqlSchemaTable from '../../lib/schema/MysqlSchemaTable';
import MariaDbSchemaTable from '../../lib/schema/MariaDbSchemaTable';
import PostgresSchemaTable from '../../lib/schema/PostgresSchemaTable';

type SchemaMeta = {
  config:ElegantConfig,
  connection:string,
  tables:SchemaTable[]
}

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

  public create(tableName:string, closure:SchemaClosure, dialect:SchemaDialect='mysql'):void {
    let table:SchemaTable;
    switch(dialect) {
      case 'mysql': table = new MysqlSchemaTable(tableName); break;
      case 'mariadb': table = new MariaDbSchemaTable(tableName); break;
      case "postgres": table = new PostgresSchemaTable(tableName); break;
    }
    this.$.tables.push(table)
    closure(table)
  }

  public drop(tableName:string, closure?:DropSchemaClosure, dialect:SchemaDialect='mysql'):void {
    const dropTable:DropSchemaTable = new DropSchemaTable(tableName, dialect)
    if (closure) closure(dropTable)
    this.$.tables.push(dropTable)
  }

  public async getTables():Promise<string[]> {
    const db = await Elegant.connection(this.$.connection)

    const tables:any[] = await db.query(`SHOW TABLES`)
    return tables.map(table => table)
  }

  get tables():SchemaTable[] {
    return this.$.tables
  }
  get config():ElegantConfig {
    return this.$.config
  }
}
