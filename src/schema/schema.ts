import SchemaTable from './schema-table';
import {Migration} from '../../index';

type SchemaMeta = {
  config:ElegantConfig,
  connection:string,
  tables:SchemaTable[]
}
type SchemaClosure = (table:SchemaTable) => void;

export default class Schema {
  private $:SchemaMeta = {
    config: undefined,
    tables: [],
    connection: 'default'
  }

  constructor( config:ElegantConfig) {
    this.$.config = config
  }

  public create(tableName:string, closure:SchemaClosure):void {
    const table = new SchemaTable(tableName)
    this.$.tables.push(table)
    closure(table)

  }

  public connection(name:string) {
    this.$.connection = name
    return this
  }

  get tables():SchemaTable[] {
    return this.$.tables
  }
  get config():ElegantConfig {
    return this.$.config
  }
}
