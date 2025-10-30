import {Operator, Scalar} from '../types.js';
import {toSnakeCase} from '../lib/util.js';

class QueryCondition {
  column:string
  operator:Operator
  value:Scalar|Scalar[]
  conjunction: 'and' | 'or'

  constructor(column:string, operator:Operator, value:Scalar|Scalar[], conjunction?:'and'|'or') {
    this.column = column
    this.operator = operator
    this.value = value
    this.conjunction = conjunction
    switch(operator) {
      case 'in':  if (!Array.isArray(value)) throw new Error('Value must be an array'); break;
      case 'between': if (!Array.isArray(value)) throw new Error('Value must be an array'); break;
    }
  }
}

class QueryConditionGroup extends QueryCondition {
  constructor(public groupType:'and' | 'or', column:string, operator:Operator, value:Scalar|Scalar[], conjunction?:'and'|'or') {
    super(column, operator, value, conjunction)
  }
}

class QueryBuilderError extends Error {
  constructor(message:string) {
    super(message)
    this.name = 'QueryBuilderError'
  }
}

class QueryMeta {
  dialect:Dialect = 'mysql'
  table:string = ''
  columns:string|string[] = '*'
  operation: 'select' | 'insert' | 'update' | 'delete' = 'select'
  specialOperator: 'scalar'| null = null
  previousCommand: 'select' | 'insert' | 'update' | 'delete' | 'scalar' | 'table'| 'where' | 'and' | 'or' |'set' = 'select'
  conditions:QueryCondition[] = []
  limit: number = undefined

  constructor(options?:QueryBuilderOptions) {
    if (options?.dialect) this.dialect = options.dialect;
  }

  validate() {
    if (!this.table) throw new QueryBuilderError('No table specified')
    if (!this.operation) throw new QueryBuilderError('No operation specified')
  }

  toSelectStatement():{sql:string, params:Scalar[]} {
    let sql:string = 'select ';
    if (Array.isArray(this.columns)) {
      sql += this.columns.map(column =>  column.trim() ).join(', ')
    } else if (this.columns === '*') {
      sql += '*'
    } else {
      sql += this.columns.split(',').map(column => column.trim()).join(', ')
    }
    sql += `\nfrom ${this.table}`
    if (!this.conditions.length) return {sql, params: []}
    const {whereSql, params} = this.toWhereStatement()
    sql += `\nwhere ${whereSql}`
    if (this.limit !== undefined) {
      sql += `\nlimit ${this.limit}`
    }
    return {sql, params}
  }
  toPlaceholders(values:any[]) {
    if (this.dialect === 'postgres') {
      return values.map((value, index) => `$${ index + 1 }`).join(',')
    } else {
      return values.map(value => '?').join(',')
    }
  }
  quote(value:any) {
    if (typeof value === 'string') {
      return `'${value}'`
    } else if(Array.isArray(value)) {
      return value.map(value => this.quote(value)).join(',')
    } else {
      return value
    }
  }
  enclose(value:any) {
    let enclosure = this.dialect === 'postgres' ? '"' : '`'
    return `${enclosure}${value}${enclosure}`
  }

  toInsertStatement():{sql:string, params:Scalar[]} {
    let params = []
    let sql = `INSERT INTO ${this.enclose(this.table)} `
    let columns:string[] = []
    this.conditions.forEach(condition => {
      columns.push(this.enclose(toSnakeCase(condition.column)))
      params.push(condition.value)
    })
    sql += `(${columns.join(', ')}) VALUES (${this.toPlaceholders(params)})`
    return {sql, params}
  }

  toWhereStatement():{whereSql:string, params:Scalar[]} {
    const params:Scalar[] = []
    const conditions:string[] = [];
    let sql:string = ''
    for (const condition of this.conditions) {
      if (condition.operator === 'in' || condition.operator === 'between' ) {
        if (!Array.isArray(condition.value)) throw new QueryBuilderError('Value must be an array')
        const placeholders = condition.value.map(() => '?').join(', ')
        if (condition.conjunction) conditions.push(condition.conjunction)
        conditions.push(`${condition.column} ${condition.operator} (${placeholders})`)
        params.push(...condition.value)
      } else {
        if (Array.isArray(condition.value)) throw new QueryBuilderError('Value must be a scalar')
        if (condition.conjunction) conditions.push(condition.conjunction)
        conditions.push(`${condition.column} ${condition.operator} ?`)
        params.push(condition.value)
      }
    }
    sql += conditions.join(' ')
    return {whereSql: sql, params: params}
  }
}
type Dialect = 'mysql'|'mariadb'|'postgres'|'sqlite'
type QueryBuilderOptions = {
  dialect?:Dialect,
}
export default class QueryBuilder {
  private $:QueryMeta

  constructor(options?:QueryBuilderOptions) {
    this.$ = new QueryMeta(options)

  }

  reset():QueryBuilder {
    this.$ = new QueryMeta()
    return this
  }

  table(tableName:string) {
    this.$.table = tableName
    this.$.previousCommand = 'table'
    return this
  }

  from(tableName:string) {
    return this.table(tableName)
  }

  select(columns:string|string[]) {
    this.$.columns = columns
    this.$.operation = 'select'
    this.$.previousCommand = 'select'
    return this
  }

  insert(values?:Record<string, Scalar>) {
    this.$.operation = 'insert'
    this.$.previousCommand = 'insert'
    if (values) {
      for (const key in values) {
        this.set(key, values[key])
      }
    }
    return this
  }

  where(columnName:string, operator:Operator|Scalar, value?:Scalar) {
    let _operator:Operator = '='
    let _value:Scalar;
    if (arguments.length === 2) {
      _value = operator
      _operator = '='
    } else {
      _operator = operator as Operator
      _value = value
    }
    this.$.previousCommand = 'where'
    this.$.conditions.push(new QueryCondition(columnName, _operator, _value))
    return this
  }

  and(columnName:string, operator:Operator, value:Scalar) {
    if (this.$.previousCommand !== 'where' && this.$.previousCommand !== 'or') throw new QueryBuilderError('and() must be used after where() | or()')
    this.$.previousCommand = 'and'
    this.$.conditions.push(new QueryCondition(columnName, operator, value, 'and'))
    return this

  }
  or(columnName:string, operator:Operator, value:Scalar) {
    if (this.$.previousCommand !== 'where' && this.$.previousCommand !== 'and') throw new QueryBuilderError('or() must be used after where() | and()')
    this.$.previousCommand = 'or'
    this.$.conditions.push(new QueryCondition(columnName, operator, value, 'or'))
    return this
  }

  set(columnName:string, value:Scalar) {
    this.$.previousCommand = 'set'
    this.$.conditions.push(new QueryCondition(columnName, '=', value))
    return this
  }

  limit(limit:number) {
    this.$.limit = limit
    return this
  }

  toStatement():{query:string, params:Scalar[]} {
    this.$.validate()

    let query:string;
    let params:Scalar[] = []

    switch(this.$.operation) {
      case 'select': {
        const parsed = this.$.toSelectStatement()
        query = parsed.sql
        params = parsed.params
        break
      }
      case 'insert': {
        const parsed = this.$.toInsertStatement()
        query = parsed.sql
        params = parsed.params
        break
      }
    }
    return {query, params}
  }

  get meta() {
    return this.$
  }
}
