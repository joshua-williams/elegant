import ColumnDefinition from './ColumnDefinition';
import ElegantTable from './ElegantTable';
import {NumberColumnDefinition, TimestampColumnDefinition} from './TableDefinitions';

export default class SqliteTable extends ElegantTable {
  boolean(columnName: string, defaultValue?: boolean, nullable?: boolean): ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'TINYINT', 1, defaultValue ? 1 : 0, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  protected columnToSql(column: ColumnDefinition): string {
    let sql = `${this.enclose(column.name)} ${column.type}`;
    if (column.$.unsigned) sql += ' UNSIGNED'
    if (column.$.nullable !== undefined) sql += column.$.nullable ? ' NULL' : ' NOT NULL'
    if (column.$.autoIncrement) sql += ' AUTO_INCREMENT'
    if (column.$.primary) {
      sql += ' PRIMARY KEY'
    } else if (column.$.unique) {
      sql += (column.$.key) ? ' UNIQUE KEY' : ' UNIQUE'
    }
    if (column.$.default) sql += ` DEFAULT ${column.$.default}`
    if (column.$.key) sql += ` KEY ${column.$.key}`
    return sql
  }
}
