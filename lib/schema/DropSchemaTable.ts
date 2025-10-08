import SchemaTable from './SchemaTable';
import ColumnDefinition from './ColumnDefinition';

export class DropSchemaTable extends SchemaTable {
  protected enclosure: string;
  _ifExists:boolean = false;

  boolean(columnName: string, defaultValue?: boolean, nullable?: boolean): ColumnDefinition { return}

  constructor(tableName:string, enclosure:string) {
    super(tableName)
  }
  public toUpdateStatement(): string {
    let ifExists = this._ifExists ? 'IF EXISTS ' : ''
    return `DROP TABLE ${ifExists}${this.enclose(this.tableName)}`
  }
  toCreateStatement(): string {
    let ifExists = this._ifExists ? 'IF EXISTS ' : ''
    return `DROP TABLE ${ifExists}${this.enclose(this.tableName)}`
  }

  ifExists():DropSchemaTable {
    this._ifExists = true
    return this
  }

}
