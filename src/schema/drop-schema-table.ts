import SchemaTable from './schema-table';

export class DropSchemaTable extends SchemaTable {
  _ifExists:boolean = false;

  constructor(tableName:string) {
    super(tableName)
  }

  toSql(): string {
    let ifExists = this._ifExists ? 'IF EXISTS ' : ''
    return `DROP TABLE ${ifExists}${this.encapsulate(this.tableName)}`
  }

  ifExists():DropSchemaTable {
    this._ifExists = true
    return this
  }

}
