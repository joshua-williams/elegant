import ColumnDefinition from './ColumnDefinition.js';
import {
  DateTimeColumnDefinition, NumberColumnDefinition,
  StringColumnDefinition,
  TimeColumnDefinition,
  TimestampColumnDefinition
} from './ColumnDefinitions.js';


export default class ElegantFunctionReturn {
  $: {returns:ColumnDefinition} = {
    returns:undefined
  }
  get returns():ColumnDefinition {
    return this.$.returns
  }

  char(length?:number):ColumnDefinition {
    const column = new StringColumnDefinition(undefined, length, 'CHAR')
    this.$.returns = column
    return column
  }

  string( length:number = 255):ColumnDefinition {
    const column = new StringColumnDefinition(undefined, length)
    this.$.returns = column
    return column
  }

  text():ColumnDefinition {
    const column = new StringColumnDefinition(undefined, undefined, 'TEXT')
    this.$.returns = column
    return column
  }

  date(defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):ColumnDefinition {
    const column = new DateTimeColumnDefinition(undefined, defaultValue, nullable)
    this.$.returns = column
    return column
  }

  time(defaultValue?:Date|'CURRENT_TIME', precision?:number, nullable?:boolean):ColumnDefinition {
    const column = new TimeColumnDefinition(undefined, defaultValue, precision, nullable)
    this.$.returns = column
    return column
  }

  dateTime(defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):TimestampColumnDefinition {
    let _default;
    if (defaultValue instanceof Date) {
      _default = defaultValue.toISOString()
    } else if (typeof defaultValue === 'string') {
      if (defaultValue !== 'CURRENT_TIMESTAMP') throw new Error('Invalid default value for dateTime()')
      _default = defaultValue
    }
    const column = new DateTimeColumnDefinition(undefined, _default, nullable)
    this.$.returns = column
    return column
  }

  timestamp(defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):TimestampColumnDefinition {
    let _default;
    if (defaultValue instanceof Date) {
      _default = defaultValue.toISOString()
    } else if (typeof defaultValue === 'string') {
      if (defaultValue !== 'CURRENT_TIMESTAMP') throw new Error('Invalid default value for timestamp()')
      _default = defaultValue
    }
    const column = new TimestampColumnDefinition(undefined, _default, nullable)
    this.$.returns = column
    return column
  }

    smallInteger(length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(undefined, 'SMALLINT', length, undefined, nullable)
    this.$.returns = column
    return column
  }

  smallInt(length?:number, nullable?:boolean):ColumnDefinition {
    return this.smallInteger( length, nullable)
  }

  bigInteger(length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(undefined, 'BIGINT', length, undefined, nullable)
    this.$.returns = column
    return column
  }

  bigInt(length?:number, nullable?:boolean):ColumnDefinition {
    return this.bigInteger(length, nullable)
  }

  integer(length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(undefined, 'INT', length, undefined, nullable)
    this.$.returns = column
    return column
  }

  int(length?:number, nullable?:boolean):ColumnDefinition {
    return this.integer(length, nullable)
  }

  unsignedSmallInteger(length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(undefined, 'SMALLINT', length, undefined, nullable)
    column.unsigned()
    this.$.returns = column
    return column
  }

  uSmallInt(length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedSmallInteger(length, nullable)
  }

  unsignedInteger(length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(undefined, 'INT', length, undefined, nullable)
    column.unsigned()
    this.$.returns = column
    return column
  }

  uInt(length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedInteger(length, nullable)
  }

  unsignedBigInteger(length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(undefined, 'BIGINT', length, undefined, nullable)
    column.unsigned()
    this.$.returns = column
    return column
  }

  uBigInt(length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedBigInteger(length, nullable)
  }

  decimal(precision:number, scale:number, nullable?:boolean):ColumnDefinition {
    const length = Number(`${precision}.${scale}`)
    const column = new NumberColumnDefinition(undefined, 'DECIMAL', length, undefined, nullable)
    this.$.returns = column
    return column
  }

  float(length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(undefined, 'FLOAT', length, undefined, nullable)
    this.$.returns = column
    return column
  }

}
