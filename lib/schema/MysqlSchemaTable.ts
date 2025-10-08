import ColumnDefinition from 'lib/schema/ColumnDefinition';
import { SchemaDialect } from 'types';
import SchemaTable from "./SchemaTable";
import {
  NumberColumnDefinition,
  StringColumnDefinition,
  TimestampColumnDefinition, YearColumnDefinition
} from './TableDefinitions';

export default class MysqlSchemaTable extends SchemaTable {
  protected enclosure: string = '`';

  mediumText(columnName:string):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, undefined, 'MEDIUMTEXT')
    this.columns.push(column)
    return column
  }
  longText(columnName:string):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, undefined, 'LONGTEXT')
    this.columns.push(column)
    return column
  }
  tinyInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'TINYINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }
  mediumInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'MEDIUMINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }
  unsignedTinyInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'TINYINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }
  unsignedMediumInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'MEDIUMINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }
  double(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'DOUBLE', length, undefined, nullable)
    this.columns.push(column)
    return column
  }
  boolean(columnName:string, defaultValue?:boolean, nullable?:boolean):ColumnDefinition {
    //@ts-ignore
    let _default: NumericDataType = (defaultValue === undefined ) ? defaultValue : (defaultValue ? 1 : 0)
    const column = new NumberColumnDefinition(columnName, 'TINYINT', 1, _default, nullable)
    this.columns.push(column)
    return column
  }

  year(columnName:string, defaultValue?:number, nullable?:boolean):ColumnDefinition {
    const column = new YearColumnDefinition(columnName, defaultValue, nullable)
    this.columns.push(column)
    return column
  }

  protected columnToSql(column: ColumnDefinition): string {
    let sql = `${this.enclose(column.name)} ${column.type}`;
    if (column.$.unsigned) sql += ' UNSIGNED'
    sql += column.$.nullable ? ' NULL' : ' NOT NULL'
    if (column.$.autoIncrement) sql += ' AUTO_INCREMENT'
    if (column.$.primary) {
      sql += ' PRIMARY KEY'
    } else if (column.$.unique) {
      sql += (column.$.key) ? ' UNIQUE KEY' : ' UNIQUE'
    }
    if (column.$.default) sql += ` DEFAULT ${column.$.default}`
    if (column instanceof TimestampColumnDefinition) {
      if (column.$.onUpdate) sql += ` ON UPDATE ${column.$.onUpdate}`
    }
    if (column.$.key) sql += ` KEY ${column.$.key}`
    if (column.$.comment) sql += ` COMMENT '${column.$.comment}'`
    return sql
  }

  public toUpdateStatement(): string {
      throw new Error('Method not implemented.');
  }
}
