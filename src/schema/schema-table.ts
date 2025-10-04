import ColumnDefinition from './column-definition';
import {
  DateTimeColumnDefinition,
  NumberColumnDefinition,
  StringColumnDefinition, TimeColumnDefinition,
  TimestampColumnDefinition, YearColumnDefinition
} from './schema-definitions';
import {getAppConfig} from '../../lib/config';

type SchemaTableMeta = {
  charset:Charset,
  collation:Collation,
  engine:string,
  temporary:boolean,
  comment:string
}
export default class SchemaTable {
  $:SchemaTableMeta ={
    charset:undefined,
    collation:undefined,
    engine:undefined,
    temporary:false,
    comment:undefined
  }
  columns:ColumnDefinition[] = []
  dialect:SchemaDialect;

  constructor(private tableName:string, connection:string = 'default', config?:ElegantConfig) {
    config = config ? config : getAppConfig()
    if (connection === 'default') {
      this.dialect = config.connections[config.default].dialect
    } else {
      this.dialect = config.connections[connection].dialect
    }
  }

  char(columnName:string, length:number = 255):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, length, 'CHAR')
    this.columns.push(column)
    return column
  }

  string(columnName:string, length:number = 255):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, length)
    this.columns.push(column)
    return column
  }

  mediumText(columnName:string):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, undefined, 'MEDIUMTEXT')
    this.columns.push(column)
    return column
  }

  text(columnName:string):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, undefined, 'TEXT')
    this.columns.push(column)
    return column
  }

  longText(columnName:string):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, undefined, 'LONGTEXT')
    this.columns.push(column)
    return column
  }

  id(columnName:string = 'id'):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', 11, undefined, false)
    column.primary()
    this.columns.push(column)
    return column
  }

  tinyInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'TINYINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  smallInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'SMALLINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  mediumInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'MEDIUMINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  integer(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  bigInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'BIGINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  unsignedTinyInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'TINYINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  unsignedSmallInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'SMALLINT', length, undefined, nullable)
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

  unsignedInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  unsignedBigInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'BIGINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  decimal(columnName:string, precision:number, scale:number, nullable?:boolean):ColumnDefinition {
    const length = Number(`${precision}.${scale}`)
    const column = new NumberColumnDefinition(columnName, 'DECIMAL', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  float(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'FLOAT', length, undefined, nullable)
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

  timestamp(columnName:string, defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):TimestampColumnDefinition {
    let _default;
    if (defaultValue instanceof Date) {
       _default = defaultValue.toISOString()
    } else if (typeof defaultValue === 'string') {
      if (defaultValue !== 'CURRENT_TIMESTAMP') throw new Error('Invalid default value for timestamp()')
      _default = defaultValue
    }
    const column = new TimestampColumnDefinition(columnName, _default, nullable)
    this.columns.push(column)
    return column
  }

  year(columnName:string, defaultValue?:number, nullable?:boolean):ColumnDefinition {
    const column = new YearColumnDefinition(columnName, defaultValue, nullable)
    this.columns.push(column)
    return column
  }

  dateTime(columnName:string, defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):TimestampColumnDefinition {
    let _default;
    if (defaultValue instanceof Date) {
       _default = defaultValue.toISOString()
    } else if (typeof defaultValue === 'string') {
      if (defaultValue !== 'CURRENT_TIMESTAMP') throw new Error('Invalid default value for dateTime()')
      _default = defaultValue
    }
    const column = new DateTimeColumnDefinition(columnName, _default, nullable)
    this.columns.push(column)
    return column
  }

  time(columnName:string, precision?:number, defaultValue?:string|number, nullable?:boolean):ColumnDefinition {
    const column = new TimeColumnDefinition(columnName, precision, defaultValue, nullable)
    this.columns.push(column)
    return column
  }

  charset(charset:Charset):SchemaTable {
    this.$.charset = charset
    return this
  }
  collation(collation:Collation):SchemaTable {
    this.$.collation = collation
    return this
  }
  engine(engine:string):SchemaTable {
    this.$.engine = engine
    return this
  }

  comment(comment:string):SchemaTable {
    this.$.comment = comment
    return this
  }
  temporary():SchemaTable {
    this.$.temporary = true
    return this
  }

  columnToSql(column:ColumnDefinition):string {
    let sql = `${this.encapsulate(column.name)} ${column.type}`;
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

  private encapsulate(value:string):string {
    switch(this.dialect) {
      case 'mysql':    return `\`${value}\``
      case 'postgres': return `"${value}"`
      case 'mssql':    return `[${value}]`
      case 'sqlite':
      default:   return value
    }
  }
  toSql():string {
    let sql = 'CREATE '
    if (this.$.temporary) sql += 'TEMPORARY '
    sql += 'TABLE ' + this.encapsulate(this.tableName) + ' (\n'
    sql += this.columns.map(column => {
      return '  ' + this.columnToSql(column)
    }).join(',\n')
    sql += '\n)'

    const tableOptions:string[] = []
    if (this.$.engine) tableOptions.push(`ENGINE=${this.$.engine}`)
    if (this.$.charset) tableOptions.push(`DEFAULT CHARSET=${this.$.charset}`)
    if (this.$.collation) tableOptions.push(`COLLATE=${this.$.collation}`)
    if (this.$.comment) tableOptions.push(`COMMENT='${this.$.comment}'`)
    if (tableOptions) sql += `\n${tableOptions.join('\n')}`
    return sql.trim()
  }
}
