import {ColumnDefinitionProperties, Scalar, SchemaDialect} from '../../types.js';

export default abstract class ColumnDefinition {
  type:string
  dialect:SchemaDialect
  private action: 'drop' | 'add' | 'change' = 'add'
  $:ColumnDefinitionProperties = {
    length:0,
    default: false,
    nullable: undefined,
    primary: false,
    unique: false,
    key: false,
    unsigned: false,
    autoIncrement: false,
    comment: '',
    collate: '',
    foreign: undefined,
    table: undefined,
    references: [],
    onUpdate: undefined,
    onDelete: undefined,
  }

  constructor(public name:string) {}

  change() {
    this.action = 'change'
    return this
  }
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
