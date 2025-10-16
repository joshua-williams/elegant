import Elegant from '../../src/Elegant.js';
import SqliteTable from '../../lib/schema/SqliteTable.js';

describe('SqliteTable', () => {
  let table:SqliteTable;
  let db:Elegant;

  beforeEach(async () => {
    db = await Elegant.connection('sqlite')
    table = new SqliteTable('users', 'create', db)
  })

  describe.skip('json columns', () => {
    it('json', async () => {
      table.json('data')
      const expected = `CREATE TABLE "users" (\n  "data" JSONB\n)`
      const sql = await table.toStatement()
      expect(sql).toEqual(expected)
    })
  })
  describe('boolean', () => {
    it('boolean', async () => {
      table.boolean('is_active')
      const sql = await table.toStatement()
      const expected = 'CREATE TABLE "users" (\n  "is_active" TINYINT\n)'
      expect(sql).toEqual(expected)
    })
    it('boolean with default value', async () => {
      table.boolean('is_active', true)
      const sql = await table.toStatement()
      const expected = 'CREATE TABLE "users" (\n  "is_active" TINYINT DEFAULT 1\n)'
      expect(sql).toEqual(expected)
    })
  })

  describe('modifiers', () => {
    it('autoIncrement', async () => {
      table.integer('id', 255).autoIncrement().primary()
      const sql = await table.toStatement()
      const expected = 'CREATE TABLE "users" (\n  "id" INT PRIMARY KEY\n)'
      expect(sql).toEqual(expected)
    })
  })

});
