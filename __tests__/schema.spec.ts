import Schema from '../src/schema/schema';

describe('schema', () => {
  it('should create table on specfic connection', () => {
    Schema.connection('postgres')
      .create('users', (table) => {
        table.temporary()
          .engine('InnoDB')
          .charset('utf8')
          .collation('utf8_unicode_ci')
          .comment('users table')
        table.integer('id', 255).autoIncrement().unique().primary()
        table.string('name').unique()
        console.log(table.toSql())
      })
  })
  describe('table', () => {

    describe('numeric columns', () => {
      it('should create tinyint', () => {
        Schema.create('users', (table) => {
          table.tinyInteger('id')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `id` TINYINT NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
      })
      it('should create smallint', () => {
        Schema.create('users', (table) => {
          table.smallInteger('id')
        })
      })
    })
    it('should create table', () => {
      Schema.create('users', (table) => {
        table.integer('id', 255).autoIncrement().unique().primary()
        table.string('name').unique()
        console.log(table.toSql())
      })
    })
  })
});
