import {SchemaTable} from './schema-table';
import {getAppConfig} from '../../lib/config';

/**
 * @todo reset connectonName = 'dfault' before each migration run
 */
export default class Schema {
  private static connectionName:string = 'default'

  public static create(tableName:string, closure:SchemaClosure):void {
    const table = new SchemaTable(tableName, this.connectionName)
    closure(table)
  }

  public static connection(name:string):typeof Schema {
    this.connectionName = name
    return this
  }
}
