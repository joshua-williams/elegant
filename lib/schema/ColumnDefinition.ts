import {ColumnDefinitionProperties, Scalar, SchemaDialect} from '../../types.js';

export default abstract class ColumnDefinition {
  type:string
  dialect:SchemaDialect
  private action: 'drop' | 'add' | 'change' | 'rename' = 'add'
  $:ColumnDefinitionProperties = {
    length:0,
    column: undefined,
    value: undefined,
    condition: undefined,
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
  drop() {
    this.action = 'drop'
    return this
  }
  rename(newName:string) {
    this.action = 'rename'
    this.$.column = newName
    return this
  }
  unique():this {
    this.$.unique = true
    return this
  }
  autoIncrement():this {
    this.$.autoIncrement = true
    return this
  }
  primary():this {
    this.$.primary = true
    return this
  }
  nullable():this {
    this.$.nullable = true
    return this
  }
  notNull():this {
    this.$.nullable = false
    return this
  }
  unsigned():this {
    this.$.unsigned = true
    return this
  }

  default(defaultValue:Scalar):this {
    this.$.default = defaultValue
    return this
  }
}
