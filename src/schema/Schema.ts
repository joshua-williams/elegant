import ElegantTable from '../../lib/schema/ElegantTable';
import Elegant from '../../index';
import {DropTable} from '../../lib/schema/DropTable';
import {DropSchemaClosure, ElegantConfig, SchemaClosure, SchemaDialect} from '../../types';
import MysqlTable from '../../lib/schema/MysqlTable';
import MariaDBTable from '../../lib/schema/MariaDBTable';
import PostgresTable from '../../lib/schema/PostgresTable';

type SchemaMeta = {
  config:ElegantConfig,
  connection:string,
  tables:ElegantTable[]
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
    let table:ElegantTable;
    switch(dialect) {
      case 'mysql': table = new MysqlTable(tableName); break;
      case 'mariadb': table = new MariaDBTable(tableName); break;
      case "postgres": table = new PostgresTable(tableName); break;
    }
    this.$.tables.push(table)
    closure(table)
  }

  public drop(tableName:string, closure?:DropSchemaClosure, dialect:SchemaDialect='mysql'):void {
    const dropTable:DropTable = new DropTable(tableName, dialect)
    if (closure) closure(dropTable)
    this.$.tables.push(dropTable)
  }

  public async getTables():Promise<string[]> {
    const db = await Elegant.connection(this.$.connection)

    const tables:any[] = await db.query(`SHOW TABLES`)
    return tables.map(table => table)
  }

  get tables():ElegantTable[] {
    return this.$.tables
  }
  get config():ElegantConfig {
    return this.$.config
  }
}
