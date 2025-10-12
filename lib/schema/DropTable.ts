import ElegantTable from './ElegantTable.js';
import ColumnDefinition from './ColumnDefinition.js';

export class DropTable extends ElegantTable {
  _ifExists:boolean = false;

  boolean(columnName: string, defaultValue?: boolean, nullable?: boolean): ColumnDefinition { return}

  async toStatement():Promise<string> {
    let ifExists = this._ifExists ? 'IF EXISTS ' : ''
    return `DROP TABLE ${ifExists}${this.enclose(this.tableName)}`
  }

  ifExists():DropTable {
    this._ifExists = true
    return this
  }

  protected getDatabaseColumns(): Promise<any[]> {
    throw new Error('Method not implemented.');
  }
}
