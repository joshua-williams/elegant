import {Operator, Scalar} from '../types.js';

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
  table:string = ''
  columns:string|string[] = '*'
  operation: 'select' | 'insert' | 'update' | 'delete' = 'select'
  specialOperator: 'scalar'| null = null
  previousCommand: 'select' | 'insert' | 'update' | 'delete' | 'scalar' | 'table'| 'where' | 'and' | 'or' = 'select'
  conditions:QueryCondition[] = []
}

export default class QueryBuilder {
  private $:QueryMeta = new QueryMeta()

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

  toStatement():{query:string, params:Scalar[]} {
    this.validate()

    let query:string;
    let params:Scalar[] = []

    switch(this.$.operation) {
      case 'select':
        const parsed = this.toSelectStatement()
        query = parsed.sql
        params = parsed.params
        break

    }
    return {query, params}
  }

  private toSelectStatement():{sql:string, params:Scalar[]} {
    let sql:string = 'select ';
    if (Array.isArray(this.$.columns)) {
      sql += this.$.columns.map(column =>  column.trim() ).join(', ')
    } else if (this.$.columns === '*') {
        sql += '*'
    } else {
      sql += this.$.columns.split(',').map(column => column.trim()).join(', ')
    }
    sql += `\nfrom ${this.$.table}`
    if (!this.$.conditions.length) return {sql, params: []}
    const {whereSql, params} = this.toWhereStatement()
    sql += `\nwhere ${whereSql}`

    return {sql, params}
  }

  private toWhereStatement():{whereSql:string, params:Scalar[]} {
    const params:Scalar[] = []
    const conditions:string[] = [];
    let sql:string = ''
    for (const condition of this.$.conditions) {
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

  validate() {
    if (!this.$.table) throw new QueryBuilderError('No table specified')
    if (!this.$.operation) throw new QueryBuilderError('No operation specified')
  }

  get meta() {
    return this.$
  }
}
