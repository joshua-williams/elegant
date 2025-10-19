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

  char(name:string, length?:number):ColumnDefinition {
    const column = new StringColumnDefinition(name, length, 'CHAR')
    this.$.returns = column
    return column
  }

  string(name:string, length:number = 255):ColumnDefinition {
    const column = new StringColumnDefinition(name, length)
    this.$.returns = column
    return column
  }

  text(name:string):ColumnDefinition {
    const column = new StringColumnDefinition(name, undefined, 'TEXT')
    this.$.returns = column
    return column
  }

  date(name:string, defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):ColumnDefinition {
    const column = new DateTimeColumnDefinition(name, defaultValue, nullable)
    this.$.returns = column
    return column
  }

  time(name:string, defaultValue?:Date|'CURRENT_TIME', precision?:number, nullable?:boolean):ColumnDefinition {
    const column = new TimeColumnDefinition(name, defaultValue, precision, nullable)
    this.$.returns = column
    return column
  }

  dateTime(name:string, defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):TimestampColumnDefinition {
    let _default;
    if (defaultValue instanceof Date) {
      _default = defaultValue.toISOString()
    } else if (typeof defaultValue === 'string') {
      if (defaultValue !== 'CURRENT_TIMESTAMP') throw new Error('Invalid default value for dateTime()')
      _default = defaultValue
    }
    const column = new DateTimeColumnDefinition(name, _default, nullable)
    this.$.returns = column
    return column
  }

  timestamp(name:string, defaultValue?:'CURRENT_TIMESTAMP'|Date, nullable?:boolean):TimestampColumnDefinition {
    let _default;
    if (defaultValue instanceof Date) {
      _default = defaultValue.toISOString()
    } else if (typeof defaultValue === 'string') {
      if (defaultValue !== 'CURRENT_TIMESTAMP') throw new Error('Invalid default value for timestamp()')
      _default = defaultValue
    }
    const column = new TimestampColumnDefinition(name, _default, nullable)
    this.$.returns = column
    return column
  }

    smallInteger(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(name, 'SMALLINT', length, undefined, nullable)
    this.$.returns = column
    return column
  }

  smallInt(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.smallInteger(name, length, nullable)
  }

  bigInteger(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(name, 'BIGINT', length, undefined, nullable)
    this.$.returns = column
    return column
  }

  bigInt(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.bigInteger(name, length, nullable)
  }

  integer(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(name, 'INT', length, undefined, nullable)
    this.$.returns = column
    return column
  }

  int(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.integer(name, length, nullable)
  }

  unsignedSmallInteger(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(name, 'SMALLINT', length, undefined, nullable)
    column.unsigned()
    this.$.returns = column
    return column
  }

  uSmallInt(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedSmallInteger(name, length, nullable)
  }

  unsignedInteger(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(name, 'INT', length, undefined, nullable)
    column.unsigned()
    this.$.returns = column
    return column
  }

  uInt(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedInteger(name, length, nullable)
  }

  unsignedBigInteger(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(name, 'BIGINT', length, undefined, nullable)
    column.unsigned()
    this.$.returns = column
    return column
  }

  uBigInt(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    return this.unsignedBigInteger(name, length, nullable)
  }

  decimal(name:string, precision:number, scale:number, nullable?:boolean):ColumnDefinition {
    const length = Number(`${precision}.${scale}`)
    const column = new NumberColumnDefinition(name, 'DECIMAL', length, undefined, nullable)
    this.$.returns = column
    return column
  }

  float(name:string, length?:number, nullable?:boolean):ColumnDefinition {
    const column = new NumberColumnDefinition(name, 'FLOAT', length, undefined, nullable)
    this.$.returns = column
    return column
  }

}
