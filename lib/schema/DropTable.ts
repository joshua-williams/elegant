import ElegantTable from './ElegantTable';
import ColumnDefinition from './ColumnDefinition';

export class DropTable extends ElegantTable {
  _ifExists:boolean = false;

  boolean(columnName: string, defaultValue?: boolean, nullable?: boolean): ColumnDefinition { return}

  toStatement(): string {
    let ifExists = this._ifExists ? 'IF EXISTS ' : ''
    return `DROP TABLE ${ifExists} ${this.enclose(this.tableName)}`
  }

  ifExists():DropTable {
    this._ifExists = true
    return this
  }

}
