import ColumnDefinition from './ColumnDefinition';
import ElegantTable from './ElegantTable';
import {GeneralColumnDefinition, NumberColumnDefinition, TimestampColumnDefinition} from './TableDefinitions';

export default class SqliteTable extends ElegantTable {
  boolean(columnName: string, defaultValue?: boolean, nullable?: boolean): ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'TINYINT', 1, defaultValue ? 1 : 0, nullable)
    column.unsigned()
    this.columns.push(column)
    return column
  }

  protected columnToSql(column: ColumnDefinition): string {
    let type = column.type;
    if (column instanceof NumberColumnDefinition) {
      [type] = column.type.split('(')
    }
    let sql = `${this.enclose(column.name)} ${type}`;
    if (column.$.nullable !== undefined) sql += column.$.nullable ? ' NULL' : ' NOT NULL'
    if (column.$.primary) {
      sql += ' PRIMARY KEY'
    } else if (column.$.unique) {
      sql += (column.$.key) ? ' UNIQUE KEY' : ' UNIQUE'
    }
    if (column.$.autoIncrement) sql += ' AUTOINCREMENT'
    if (column.$.default) sql += ` DEFAULT ${column.$.default}`
    if (column.$.key) sql += ` KEY ${column.$.key}`
    return sql
  }
  protected async getDatabaseColumns(): Promise<any[]> {
    let query = `SELECT name FROM pragma_index_list('${this.tableName}') WHERE origin = 'u' AND "unique" = 1`
    const uniqueKeys =  (await this.db.select(query)).map((field:any) => field.name)
    const uniqueColumns:string[] = []
    for (let key of uniqueKeys) {
      query = `PRAGMA index_info('${key}')`
      const columns = (await this.db.select(query)).map((field:any) => field.name)
      uniqueColumns.push(...columns)
    }
    query = `PRAGMA table_info('${this.tableName}')`
    return this.db.select(query).then(fields => fields.map((field:any) => {
      let {name, type:dataType, notnull, dflt_value, pk} = field
      let match = dataType.match(/(\w+)(\((\d+)\))?/)
      let [, type, , size] = match
      dataType = dataType.toLowerCase()
      if (dataType === 'integer') dataType = 'int'
      let column = new GeneralColumnDefinition(name, dataType, Number(size)||undefined)
      if (dflt_value) column.default(dflt_value)
      if (pk === 1) column.primary()
      if (notnull) column.notNull()
      if (uniqueColumns.includes(name)) column.unique()
      return column
    }))

  }
}
