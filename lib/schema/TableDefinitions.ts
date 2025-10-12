import ColumnDefinition from './ColumnDefinition.js';
import {NumericDataType, Scalar} from '../../types.js';

export class GeneralColumnDefinition extends ColumnDefinition {

  constructor(name:string, type?:string, length?:number) {
    super(name);
    if (type) this.type = type;
    if (length) this.$.length = length;
  }
}

export class NumberColumnDefinition extends ColumnDefinition {
  type:NumericDataType = 'INT'
  constructor(name:string, type:NumericDataType, length?:number, _default?:number, nullable?:boolean) {
    super(name)

    if (['DOUBLE','FLOAT'].includes(type)) {
      this.type = type
    } else if (type === 'DECIMAL') {
      const [precision, scale] = String(length).split('.')
      //@ts-ignore
      this.type = `DECIMAL(${precision},${scale})`
    } else {
      this.$.length = length;
      //@ts-ignore
      this.type = length === undefined ? type : `${type}(${length})`
    }

    if (_default != undefined) this.$.default = _default;
    if (nullable != undefined) this.$.nullable = nullable
  }
}

export class StringColumnDefinition extends ColumnDefinition {
  type:string = 'VARCHAR(255)'
  constructor(name:string, length:number=255, type:string='VARCHAR', nullable?:boolean) {
    super(name)
    this.$.length = length
    this.$.nullable = nullable
    if ( ['TEXT','MEDIUMTEXT','LONGTEXT'].includes(type) ) {
      this.type = type
    } else {
      //@ts-ignore
      this.type = length ? `${type}(${length})` : type
    }
  }
  default(defaultValue:Scalar) {
    this.$.default = `'${defaultValue}'`
    return this
  }
}

export class TimestampColumnDefinition extends ColumnDefinition {
  type:string = 'TIMESTAMP'
  constructor(name:string, defaultValue:'CURRENT_TIMESTAMP' | Date, nullable?:boolean) {
    super(name)
    this.default(defaultValue)
    this.$.nullable = nullable
  }

  default(defaultValue:Scalar|Date) {
    if (defaultValue instanceof Date) {
      this.$.default = `'${defaultValue.toISOString()}'`
    } else if (defaultValue === 'CURRENT_TIMESTAMP') {
      this.$.default = 'CURRENT_TIMESTAMP'
    } else if (defaultValue) {
      this.$.default = `'${defaultValue}'`
    }
    return this
  }
  onUpdate(value:'CURRENT_TIMESTAMP' | Date) {
    if (value instanceof Date) {
      this.$.onUpdate = `'${value.toISOString()}'`
    } else if (value === 'CURRENT_TIMESTAMP') {
      this.$.onUpdate = 'CURRENT_TIMESTAMP'
    } else {
      this.$.onUpdate = `'${value}'`
    }
  }
}

export class TimeColumnDefinition extends ColumnDefinition {
  type:string = 'TIME'
  constructor(name:string, defaultValue?:'CURRENT_TIME' | Date, precision?:number, nullable?:boolean) {
    super(name)
    this.$.nullable = nullable
    if (precision) this.type = `TIME(${precision})`
    if (defaultValue instanceof Date) {
      this.$.default =`${defaultValue.getHours()}:${defaultValue.getMinutes()}:${defaultValue.getSeconds()}`
    } else if (defaultValue === 'CURRENT_TIME') {
      this.$.default = 'CURRENT_TIME'
    } else {
      this.$.default = defaultValue
    }
  }
  precision(precision:number) {
    this.type = `TIME(${precision})`
    return this
  }
}

export class BooleanColumnDefinition extends ColumnDefinition {
  type:string = 'BOOLEAN'
  constructor(name:string, defaultValue?:boolean, nullable?:boolean) {
    super(name)
    this.$.default = defaultValue
    this.$.nullable = nullable
  }
}

export class DateTimeColumnDefinition extends TimestampColumnDefinition {
  type:string = 'DATETIME'
}

export class YearColumnDefinition extends ColumnDefinition {
  type:string = 'YEAR'
  constructor(name:string, defaultValue?:number, nullable?:boolean) {
    super(name)
    this.$.default = defaultValue
    this.$.nullable = nullable
  }
}
