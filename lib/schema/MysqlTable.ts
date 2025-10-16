import ColumnDefinition from 'lib/schema/ColumnDefinition.js';
import ElegantTable from "./ElegantTable.js";
import {
  GeneralColumnDefinition, JsonColumnDefinition,
  NumberColumnDefinition,
  StringColumnDefinition,
  TimestampColumnDefinition, YearColumnDefinition
} from './ColumnDefinitions.js';

export default class MysqlTable extends ElegantTable {
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

  json(columnName:string, defaultValue?:any, nullable?:boolean):ColumnDefinition {
    const column = new JsonColumnDefinition(columnName, defaultValue, nullable)
    this.columns.push(column)
    return column
  }

  protected columnsToSql() {
    let sql = '  ' + this.columns
      .map(column => this.columnToSql(column))
      .join(',\n  ')
    if (this.hasMultiplePrimaryKeys()) {
      sql += `,\nPRIMARY KEY(\`${this.getPrimaryKeyColumns().map(c => c.name).join('`, `')}\`)`
    }
    return sql
  }
  protected columnToSql(column: ColumnDefinition): string {
    let sql = `${this.enclose(column.name)} ${column.type}`;
    if (column.$.unsigned) sql += ' UNSIGNED'
    if (column.$.nullable !== undefined) sql += column.$.nullable ? ' NULL' : ' NOT NULL'
    if (column.$.autoIncrement) sql += ' AUTO_INCREMENT'
    if (column.$.primary && !this.hasMultiplePrimaryKeys()) {
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

  protected getDatabaseColumns():Promise<any[]> {
    return this.db.query(`DESCRIBE ${this.enclose(this.tableName)}`)
      .then(fields => fields.map((field:any) => {
        const match = field.Type.match(/(\w+)(\((\d+)\))?/)
        let [_, type, , length] = match || []
        type = length ? `${type}(${length})` : type
        const column = new GeneralColumnDefinition(field.Field, type, Number(length)||undefined)
        if (field.Null === 'YES') column.null()
        if (field.Type.includes('unsigned')) column.unsigned()
        if (field.Extra === 'auto_increment') column.autoIncrement()
        if (field.Key === 'PRI') column.primary()
        if (field.Key === 'UNI') column.unique()
        if (field.Default) column.default(field.Default)
        return column

      }))
  }
}
