import QueryBuilder from '../src/QueryBuilder.js';

describe('query builder', () => {
  let qb:QueryBuilder = new QueryBuilder();

  beforeEach(() => {
    qb.reset()
  })

  it('should set the table', () => {
    qb.table('migrations')
    const expected = 'select *\nfrom migrations'
    const {query} = qb.parse()
    expect(query).toEqual(expected)
  })

  describe('select', () => {
    it('should set the columns', () => {
      qb.table('migrations')
        .select('id, migration')
      const expected = 'select id, migration\nfrom migrations'
      const {query} = qb.parse()
      expect(query).toEqual(expected)
    })
    it('should set the columns as array', () => {
      qb.select(['id', 'migration'])
        .from('migrations')
      const expected = 'select id, migration\nfrom migrations'
      const {query} = qb.parse()
      expect(query).toEqual(expected)
    })
  })

  describe('where', () => {
    it('should set the where clause', () => {
      qb.table('migrations')
        .where('migration', '=', 'contacts')
      const expected = 'select *\nfrom migrations\nwhere migration = ?'
      const {query, params} = qb.parse()
      expect(query).toEqual(expected)
      expect(params).toEqual(['contacts'])
    })
    it('should set the where clause with "and" condition', () => {
      qb.table('migrations')
      .where('migration', '=', 'contacts')
      .and('batch', '=', 5)
      const expected = 'select *\nfrom migrations\nwhere migration = ? and batch = ?'
      const {query, params} = qb.parse()
      expect(query).toEqual(expected)
      expect(params).toEqual(['contacts',5])
    })
    it('should set the where clause with "or" condition', () => {
      qb.table('migrations')
      .where('migration', '=', 'contacts')
      .or('batch', '=', 5)
      const expected = 'select *\nfrom migrations\nwhere migration = ? or batch = ?'
      const {query, params} = qb.parse()
      expect(query).toEqual(expected)
      expect(params).toEqual(['contacts',5])
    })
  })
  it('should reset', () => {
    qb.table('migrations').where('migration', '=', 'contacts')
    qb.reset()
    const meta = qb.meta;
    expect(meta).toHaveProperty('table', '')
    expect(meta).toHaveProperty('operation', 'select')
    expect(meta).toHaveProperty('columns', '*')
    expect(meta).toHaveProperty('specialOperator', null)
    expect(meta).toHaveProperty('previousCommand', 'select')
    expect(meta).toHaveProperty('conditions', [])
  })

});
