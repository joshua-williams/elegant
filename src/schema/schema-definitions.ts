import ColumnDefinition from './column-definition';

export class NumberColumnDefinition extends ColumnDefinition {
  type:NumericDataType = 'INT'
  constructor(name:string, type:NumericDataType, length?:number, _default?:NumericDataType, nullable?:boolean) {
    super(name)
    this.type = type;
    this.$.length = length;
    if (_default != undefined) this.$.default = _default;
    if (nullable != undefined) this.$.nullable = nullable
  }


}

export class StringColumnDefinition extends ColumnDefinition {
  type:string = 'VARCHAR(255)'
  constructor(name:string, length:number=255, nullable?:boolean) {
    super(name)
    this.$.length = length
    this.$.nullable = nullable
    this.type = `VARCHAR(${length})`
  }

}
