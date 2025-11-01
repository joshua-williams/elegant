import {Charset, Collation, ElegantTableAction, Scalar} from '../../types.js';
import ColumnDefinition from './ColumnDefinition.js';
import {
  CheckColumnDefinition, ConstraintColumnDefinition, ForeignKeyConstraintColumnDefinition, GeneralColumnDefinition,
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
  protected constraints:ConstraintColumnDefinition[] = []
  protected statements: Map<string, string[]> = new Map()
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

  /**
   * Defines a foreign key constraint for the specified column(s).
   *
   * @param {string|string[]} columnName - The name of the column(s) in the current table to define the foreign key constraint on.
   * @param {string} [tableName] - The name of the table that the foreign key references. If not provided, it is inferred from the column name.
   * @param {string|string[]} [references] - The column(s) in the referenced table that the foreign key points to. Defaults to the same name(s) as the current column(s).
   * @return {ForeignKeyConstraintColumnDefinition} An instance of ForeignKeyConstraintColumnDefinition representing the defined foreign key constraint.
   */
  foreign(columnName:string|string[], tableName?:string, references?:string|string[]):ForeignKeyConstraintColumnDefinition {
    if (Array.isArray(columnName)) {
      columnName.forEach(columnName => {
        const column = this.columns.find((c:ColumnDefinition) => c.name === columnName)
        if (!column) throw new Error(`Column '${columnName}' does not exist in table '${this.tableName}'`)
      })
    }
    const keyName = Array.isArray(columnName) ? `fk_${this.tableName}_${columnName.join('_')}` : `fk_${this.tableName}_${columnName}`
    const column = new ForeignKeyConstraintColumnDefinition(keyName)
    if (!tableName && typeof columnName === 'string') {
      tableName = inferTableNameFromColumn(columnName)
    }

    column.foreign(columnName).on(tableName).references(references||columnName)
    this.constraints.push(column)
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
    let column = new StringColumnDefinition(name, 255)
    this.columns.push(column)
    const constraint = new CheckColumnDefinition(`${name}_chk`, values)
    constraint.where(name, 'IN', values)
    this.constraints.push(constraint)
    return constraint
  }

  protected abstract getDatabaseColumns():Promise<any[]>

  protected abstract columnsToSql():string

  abstract boolean(columnName:string, defaultValue?:boolean, nullable?:boolean):ColumnDefinition

  abstract json(columnName:string, defaultValue?: any, nullable?:boolean):ColumnDefinition

  abstract fn(name:string, createFunction: (fn:ElegantFunction) => void)

  abstract functionToStatement(fn:ElegantFunction):string

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

    return this.constraints
      .map(column => {
        let sql = `CONSTRAINT ${this.enclose(column.name)}`

        if (column instanceof ForeignKeyConstraintColumnDefinition) {
          if (!column.$.foreign) {
            throw new Error(`Column '${column.name}' does not exist in table '${this.tableName}'`)
          }
          const columns = (column.$.foreign as string[]).map(c => this.enclose(c)).join(', ')
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

  public toStatement():string {
    this.columns.some((column:any) => {
      if (column.action !== 'add') {
        return this.action = 'alter'
      }
    })
    if (!this.action) throw new Error('Table action must be defined before generating statement: eg table.destroy() | table.create() | table.alter()')
    this.columns.filter(column => column.$.foreign instanceof ConstraintColumnDefinition)
      .forEach(column => {
        const constraint = column.$.foreign as ForeignKeyConstraintColumnDefinition
        // to ensure unique foreign key names across tables use convention fk_{left_tableName}_{right_table_name}_{column}_{column}_etc
        constraint.name = constraint.name.replace(/^fk_/, `fk_${this.tableName}_`)
        this.constraints.push(constraint)
      })
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
        if (this.constraints.length) sql += ',\n  ' + this.constraintsToSql()
        sql += '\n)'
        const tableOptions:string[] = []
        if (this.$.engine) tableOptions.push(`ENGINE=${this.$.engine}`)
        if (this.$.charset) tableOptions.push(`DEFAULT CHARSET=${this.$.charset}`)
        if (this.$.collation) tableOptions.push(`COLLATE=${this.$.collation}`)
        if (this.$.comment) tableOptions.push(`COMMENT='${this.$.comment}'`)
        if (tableOptions) sql += `\n${tableOptions.join('\n')}`
        return sql.trim()
      case 'alter':
        sql += `ALTER TABLE ${this.enclose(this.tableName)}\n`
        for (const column of this.columns) {
          let c:any = column
          if (c.action === 'rename') {
            sql += `RENAME COLUMN ${this.enclose(c.name)} TO ${this.enclose(c.$.column)}\n`
          }else if (c.action === 'drop') {
            sql += `DROP COLUMN ${this.enclose(c.name)}\n`
          } else {
            sql += `MODIFY COLUMN ${this.columnToSql(column)}\n`
          }
        }
        return sql.trim()
      case 'drop':
        sql += `DROP TABLE `
        if (this.$.ifExists) sql += 'IF EXISTS '
        sql += `${this.enclose(this.tableName)}`
        return sql.trim()

    }
    return
  }

  public getStatements():Map<string, string[]> {
    return this.statements
  }

  public dropColumn(column:string|string[]) {
    if (Array.isArray(column)) {
      for (const col of column) {
        this.columns.push(new GeneralColumnDefinition(col).drop())
      }
    } else {
      this.columns.push(new GeneralColumnDefinition(column).drop())
    }
  }
  public renameColumn(oldName:string, newName:string) {
    const column = new GeneralColumnDefinition(oldName).rename(newName)
    this.columns.push(column)
  }
  public create() {
    this.action = 'create'
  }
  public alter() {
    this.action = 'alter'
  }
  public drop() {
    this.action = 'drop'
  }
}
