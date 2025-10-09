import {Charset, Collation, ElegantTableAction, SchemaDialect} from '../../types';
import ColumnDefinition from './ColumnDefinition';
import {
  DateTimeColumnDefinition, NumberColumnDefinition,
  StringColumnDefinition, TimeColumnDefinition,
  TimestampColumnDefinition
} from './TableDefinitions';

type SchemaTableMeta = {
  charset:Charset,
  collation:Collation,
  engine:string,
  temporary:boolean,
  comment:string,
  ifExists:boolean,
  ifNotExists:boolean,
}

export default abstract class ElegantTable {
  protected enclosure = '"';
  protected action:ElegantTableAction = 'create'
  protected columns:ColumnDefinition[] = []
  protected tableName:string
  protected schema:string

  $:SchemaTableMeta ={
    charset:undefined,
    collation:undefined,
    engine:undefined,
    temporary:false,
    comment:undefined,
    ifExists:false,
    ifNotExists:false,
  }
  constructor(tableName:string, action:ElegantTableAction, enclosure?:string) {
    this.tableName = tableName
    this.action = action;
    if (enclosure) this.enclosure = enclosure
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

  text(columnName:string):ColumnDefinition {
    const column = new StringColumnDefinition(columnName, undefined, 'TEXT')
    this.columns.push(column)
    return column
  }

  date(columnName:string, defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):ColumnDefinition {
    const column = new DateTimeColumnDefinition(columnName, defaultValue, nullable)
    this.columns.push(column)
    return column
  }

  time(columnName:string, defaultValue?:Date|'CURRENT_TIME', precision?:number, nullable?:boolean):ColumnDefinition {
    const column = new TimeColumnDefinition(columnName, defaultValue, precision, nullable)
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

  id(columnName:string = 'id'):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT')
    column.autoIncrement().primary()
    this.columns.push(column)
    return column
  }
  smallInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'SMALLINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  bigInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'BIGINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  integer(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  unsignedSmallInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'SMALLINT', length, undefined, nullable)
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

  abstract boolean(columnName:string, defaultValue?:boolean, nullable?:boolean):ColumnDefinition


  charset(charset:Charset):ElegantTable {
    this.$.charset = charset
    return this
  }

  collation(collation:Collation):ElegantTable {
    this.$.collation = collation
    return this
  }

  engine(engine:string):ElegantTable {
    this.$.engine = engine
    return this
  }

  comment(comment:string):ElegantTable {
    this.$.comment = comment
    return this
  }

  temporary():ElegantTable {
    this.$.temporary = true
    return this
  }

  protected enclose(value:string):string {
    return `${this.enclosure}${value}${this.enclosure}`
  }

  protected columnToSql(column:ColumnDefinition):string { return }

  public toStatement():string {
    let sql = ''
    switch (this.action) {
      case 'create':
        sql += 'CREATE'
        if (this.$.temporary) sql += ' TEMPORARY'
        sql += ` TABLE`
        if (this.$.ifNotExists) sql += ' IF NOT EXISTS '
        if (this.schema) sql += ` ${this.enclose(this.schema)}`
        sql += `${this.enclose(this.tableName)}`
        sql+= '(\n'
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
      case 'alter':
        sql += `ALTER TABLE ${this.enclose(this.tableName)}`
        sql += this.columns.map(column => {
          return ` ${this.columnToSql(column)}`
        })
        return sql.trim()
      case 'drop':
        sql += `DROP TABLE ${this.enclose(this.tableName)}`
        return sql.trim()

    }
    return
  }

  ifExists():ElegantTable {
    this.$.ifExists = true
    return this
  }

  ifNotExists():ElegantTable {
    this.$.ifNotExists = true
    return this
  }
}
