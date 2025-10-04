import ColumnDefinition from './column-definition';

export class NumberColumnDefinition extends ColumnDefinition {
  type:NumericDataType = 'INT'
  constructor(name:string, type:NumericDataType, length?:number, _default?:NumericDataType, nullable?:boolean) {
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

export class TimeColumnDefinition extends ColumnDefinition {
  type:string = 'TIME'
  constructor(name:string, precison?:number, defaultValue?:string|number, nullable?:boolean) {
    super(name)
    this.$.default = defaultValue
    this.$.nullable = nullable
    if (precison) {
      this.type = `TIME(${precison})`
    } else {
      this.type = 'TIME'
    }

  }
}
