import {Charset, Collation, ElegantTableAction, Scalar} from '../../types.js';
import ColumnDefinition from './ColumnDefinition.js';
import {
  CheckColumnDefinition, ConstraintColumnDefinition, ForeignKeyConstraintColumnDefinition,
  NumberColumnDefinition, StringColumnDefinition,
} from './ColumnDefinitions.js';
import Elegant from '../../src/Elegant.js';
import {inferTableNameFromColumn} from '../util.js';
import ElegantTableCore from './ElegantTableCore.js';
import ElegantFunction from './ElegantFunction.js';

type SchemaTableMeta = {
  charset:Charset,
  collation:Collation,
  engine:string,
  temporary:boolean,
  comment:string,
  ifExists:boolean,
  ifNotExists:boolean,
}

export default abstract class ElegantTable extends ElegantTableCore {
  protected enclosure = '"';
  protected action:ElegantTableAction = 'create'
  protected columns:ColumnDefinition[] = []
  protected functions: ElegantFunction[] = []
  protected tableName:string
  protected schema:string
  protected db:Elegant
  $:SchemaTableMeta ={
    charset:undefined,
    collation:undefined,
    engine:undefined,
    temporary:false,
    comment:undefined,
    ifExists:false,
    ifNotExists:false
  }

  constructor(tableName:string, action:ElegantTableAction, db:Elegant) {
    super()
    this.tableName = tableName
    this.action = action;
    this.db = db
    switch(db.constructor.name.toLowerCase()) {
      case 'mysql':
      case 'mariadb':
        this.enclosure = '`'
        break
      case 'sqlite':
        this.enclosure = '"'
        break
      case 'postgres':
        this.enclosure = '"'
        break
    }
  }

  timestamps() {
    this.timestamp('created_at', 'CURRENT_TIMESTAMP')
    this.timestamp('updated_at', 'CURRENT_TIMESTAMP')
      .onUpdate('CURRENT_TIMESTAMP')
  }

  id(columnName:string = 'id'):ColumnDefinition {
    const column = new NumberColumnDefinition(columnName, 'INTEGER', 11)
    column.autoIncrement().primary().unsigned()
    this.columns.push(column)
    return column
  }

  protected hasMultiplePrimaryKeys() {
    return this.columns.filter(column => column.$.primary).length > 1
  }

  protected hasConstraint() {
    return this.columns.some(column => column instanceof ConstraintColumnDefinition)
  }

  protected getPrimaryKeyColumns() {
    return this.columns.filter(column => column.$.primary)
  }

  foreign(columnName:string|string[], tableName?:string, references?:string|string[]):ForeignKeyConstraintColumnDefinition {
    if (Array.isArray(columnName)) {
      columnName.forEach(columnName => {
        const column = this.columns.find((c:ColumnDefinition) => c.name === columnName)
        if (!column) throw new Error(`Column '${columnName}' does not exist in table '${this.tableName}'`)
      })
    }
    const keyName = Array.isArray(columnName) ? `fk_${columnName.join('_')}` : `fk_${columnName}`
    const column = new ForeignKeyConstraintColumnDefinition(keyName)
    if (!tableName && typeof columnName === 'string') {
      tableName = inferTableNameFromColumn(columnName)
    }

    column.foreign(columnName).on(tableName).references(references||columnName)
    this.columns.push(column)
    return column
  }

  primary(columns:string[]) {
    columns.forEach((columnName:string) => {
      let column = this.columns.find((c:ColumnDefinition) => c.name === columnName)
      if(!column) {
        throw new Error(`Column '${columnName}' does not exist in table '${this.tableName}'`)
      }
      column.primary()
    })
  }


  enum(name:string, values:Scalar[]):CheckColumnDefinition {
    let column = new StringColumnDefinition(name, 0)
    this.columns.push(column)
    const constraint = new CheckColumnDefinition(`${name}_chk`, values)
    constraint.where(name, 'IN', values)
    this.columns.push(constraint)
    return constraint
  }

  protected abstract getDatabaseColumns():Promise<any[]>

  protected abstract columnsToSql():string

  abstract boolean(columnName:string, defaultValue?:boolean, nullable?:boolean):ColumnDefinition

  abstract json(columnName:string, defaultValue?: any, nullable?:boolean):ColumnDefinition

  abstract fn(name:string, createFunction: (fn:ElegantFunction) => void)

  collation(collation:Collation):ElegantTable {
    this.$.collation = collation
    return this
  }

  engine(engine:string):ElegantTable {
    this.$.engine = engine
    return this
  }

  comment(comment:string):ElegantTable {
    this.$.comment = comment
    return this
  }

  temporary():ElegantTable {
    this.$.temporary = true
    return this
  }

  ifExists():ElegantTable {
    this.$.ifExists = true
    return this
  }

  ifNotExists():ElegantTable {
    this.$.ifNotExists = true
    return this
  }

  protected enclose(value:Scalar):Scalar {
    if (typeof value === 'string') {
      return `${this.enclosure}${value}${this.enclosure}`
    } else {
      return value
    }
  }


  protected columnToSql(column:ColumnDefinition):string { return }

  protected constraintsToSql(): string {
    return this.columns
      .filter(column => (column instanceof ConstraintColumnDefinition))
      .map(column => {
        let sql = `CONSTRAINT ${this.enclose(column.name)}`

        if (column instanceof ForeignKeyConstraintColumnDefinition) {
          const columns = column.$.foreign.map(c => this.enclose(c)).join(', ')
          sql += `\n    FOREIGN KEY (${columns})`
          const references = column.$.references.map(c => this.enclose(c)).join(', ')
          sql+= `\n    REFERENCES ${this.enclose(column.$.table)}(${references})`
          if (column.$.onUpdate) sql += `\n    ON UPDATE ${column.$.onUpdate}`
          if (column.$.onDelete) sql += `\n    ON DELETE ${column.$.onDelete}`
        } else if (column instanceof CheckColumnDefinition) {
          sql += ` CHECK (${this.enclose(column.$.condition.column)} ${column.$.condition.operator} `
          if (['IN', 'BETWEEN'].includes(column.$.condition.operator.toUpperCase())) {
            if (Array.isArray(column.$.condition.value)) {
              const values = column.$.condition.value
                .map(value => (typeof value === 'string') ?`'${value}'` : value)
                .join(', ')
              sql += `(${values}))`
            }
          }
        }
        return sql
      }).join(',  \n')
  }

  public async toStatement():Promise<string> {
    let sql = ''
    switch (this.action) {
      case 'create':
        sql += 'CREATE'
        if (this.$.temporary) sql += ' TEMPORARY'
        sql += ` TABLE `
        if (this.$.ifNotExists) sql += 'IF NOT EXISTS '
        if (this.schema) sql += ` ${this.enclose(this.schema)}`
        sql += `${this.enclose(this.tableName)} (\n`
        sql += this.columnsToSql()
        if (this.hasConstraint()) sql += ',\n  ' + this.constraintsToSql()
        sql += '\n)'
        const tableOptions:string[] = []
        if (this.$.engine) tableOptions.push(`ENGINE=${this.$.engine}`)
        if (this.$.charset) tableOptions.push(`DEFAULT CHARSET=${this.$.charset}`)
        if (this.$.collation) tableOptions.push(`COLLATE=${this.$.collation}`)
        if (this.$.comment) tableOptions.push(`COMMENT='${this.$.comment}'`)
        if (tableOptions) sql += `\n${tableOptions.join('\n')}`
        return sql.trim()
      case 'alter':
        const existingColumns = await this.getDatabaseColumns()
        const existingColumnNames = existingColumns.map(column => column.name)
        sql += `ALTER TABLE ${this.enclose(this.tableName)}`
        sql += this.columns.map(column => {
          return ` ${this.columnToSql(column)}`
        })
        return sql.trim()
      case 'drop':
        sql += `DROP TABLE ${this.enclose(this.tableName)}`
        return sql.trim()

    }
    return
  }

}
