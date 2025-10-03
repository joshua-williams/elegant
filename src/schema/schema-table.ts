import ColumnDefinition from './column-definition';
import {NumberColumnDefinition, StringColumnDefinition} from './schema-definitions';
import {getAppConfig} from '../../lib/config';

type SchemaTableMeta = {
  charset:Charset,
  collation:Collation,
  engine:string,
  temporary:boolean,
  comment:string
}
export class SchemaTable {
  $:SchemaTableMeta ={
    charset:undefined,
    collation:undefined,
    engine:undefined,
    temporary:false,
    comment:undefined
  }
  columns:ColumnDefinition[] = []
  dialect:SchemaDialect;

  constructor(private name:string, connection:string = 'default') {
    const config = getAppConfig()
    this.dialect = config.connections[connection].dialect
  }

  string(columnName:string, length:number = 255):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, length)
    this.columns.push(column)
    return column
  }

  id(columnName:string = 'id'):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', 11, undefined, false)
    column.primary()
    this.columns.push(column)
    return column
  }

  bigInteger(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'BIGINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  decimal(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'DECIMAL', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  float(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'FLOAT', length, undefined, nullable)
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

  unsignedInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  unsignedBigInteger(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'BIGINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  unsignedDecimal(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'DECIMAL', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  unsignedFloat(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'FLOAT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  unsignedTinyInteger(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'TINYINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  unsignedSmallInteger(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'SMALLINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  unsignedMediumInteger(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'MEDIUMINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  boolean(columnName:string, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'TINYINT', 1, undefined, nullable)
    this.columns.push(column)
    return column
  }

  integer(columnName:string, length:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', length, undefined, nullable)
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
    let sql = `CREATE ${this.$.temporary && 'TEMPORARY '}TABLE ${this.encapsulate(this.name)} (\n`
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
    return sql
  }
}
