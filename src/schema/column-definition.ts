export default abstract class ColumnDefinition {
  type:string
  dialect:SchemaDialect
  $:ColumnDefinitionProperties = {
    length:0,
    default: false,
    nullable: false,
    primary: false,
    unique: false,
    key: false,
    unsigned: false,
    autoIncrement: false,
    comment: '',
    collate: '',
    onUpdate: undefined,
  }

  constructor(public name:string) {}

  unique():ColumnDefinition {
    this.$.unique = true
    return this
  }
  autoIncrement():ColumnDefinition {
    this.$.autoIncrement = true
    return this
  }
  primary():ColumnDefinition {
    this.$.primary = true
    return this
  }
  null():ColumnDefinition {
    this.$.nullable = true
    return this
  }
  notNull():ColumnDefinition {
    this.$.nullable = false
    return this
  }
  unsigned():ColumnDefinition {
    this.$.unsigned = true
    return this
  }

  default(defaultValue:Scalar) {
    this.$.default = defaultValue
    return this
  }


}
