import ColumnDefinition from './ColumnDefinition.js';
import {
  DateTimeColumnDefinition, NumberColumnDefinition,
  StringColumnDefinition,
  TimeColumnDefinition,
  TimestampColumnDefinition
} from './ColumnDefinitions.js';

export default class ElegantTableCore {
  protected columns: ColumnDefinition[] = []

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

  smallInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'SMALLINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  smallInt(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.smallInteger(columnName, length, nullable)
  }

  bigInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'BIGINT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  bigInt(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.bigInteger(columnName, length, nullable)
  }

  integer(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', length, undefined, nullable)
    this.columns.push(column)
    return column
  }

  int(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.integer(columnName, length, nullable)
  }

  unsignedSmallInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'SMALLINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  uSmallInt(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedSmallInteger(columnName, length, nullable)
  }

  unsignedInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  uInt(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedInteger(columnName, length, nullable)
  }

  unsignedBigInteger(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'BIGINT', length, undefined, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  uBigInt(columnName:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedBigInteger(columnName, length, nullable)
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

  getColumns():ColumnDefinition[] {
    return this.columns
  }
}

