import SchemaTable from './schema-table';

type SchemaMeta = {
  connection:string,
  tables:SchemaTable[]
}
type SchemaClosure = (table:SchemaTable) => void;

export default class Schema {
  private $:SchemaMeta = {
    tables: [],
    connection: 'default'
  }

  public create(tableName:string, closure:SchemaClosure):void {
    const table = new SchemaTable(tableName, this.$.connection)
    this.$.tables.push(table)
    closure(table)
  }

  public connection(name:string) {
    this.$.connection = name
    return this
  }
}
