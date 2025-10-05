import Schema from '../src/schema/schema';
import {getAppConfig} from '../lib/config';

let schema:Schema;

describe('schema', () => {
  beforeEach(async () => {
    const config = getAppConfig()
    schema = new Schema(config)
  })
  it('should create table on specfic connection', () => {
    schema.connection('postgres')
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
        schema.create('users', (table) => {
          table.tinyInteger('id')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `id` TINYINT NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
      })
      it('should create smallint', () => {
        schema.create('users', (table) => {
          table.smallInteger('id')
        })
      })
    })
    it('should create table', () => {
      schema.create('users', (table) => {
        table.integer('id', 255).autoIncrement().unique().primary()
        table.string('name').unique()
        console.log(table.toSql())
      })
    })
  })

  describe('drop table', () => {
    it('should drop table', () => {
      schema.drop('users', table => {
        table.ifExists()
        expect(table.toSql()).toEqual('DROP TABLE IF EXISTS `users`')
      })
    })
  })

  describe('inspect database', ()=> {
    it('should get tables', async () => {
      const tables = await schema.getTables()
      console.log(tables)
    })
  })
});
