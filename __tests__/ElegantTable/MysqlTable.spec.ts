import MysqlTable from '../../lib/schema/MysqlTable.js';
import Elegant from '../../src/Elegant.js';

describe('MysqlTable', () => {
  let table:MysqlTable;
  let db:Elegant;

  beforeEach(async () => {
    db = await Elegant.connection('mysql')
    table = new MysqlTable('users', 'create', db)
  })

  describe('json columns', () => {
    it('json', async () => {
      table.json('data')
      const sql = await table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `data` JSON\n)'
      expect(sql).toEqual(expected)
    })
  })
  describe('string columns', () => {
    it('mediumText', async () => {
      table.mediumText('description')
      const sql = await table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `description` MEDIUMTEXT\n)'
      expect(sql).toEqual(expected)
    })
    it('longText',  async () => {
      table.longText('description')
      const sql = await table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `description` LONGTEXT\n)'
      expect(sql).toEqual(expected)
    })
  })

  describe('numeric columns', () => {

    describe('signed', () => {
      it('tinyint', async () => {
        table.tinyInteger('id')
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` TINYINT\n)'
        expect(sql).toEqual(expected)
      })
      it('mediumint', async () => {
        table.mediumInteger('id')
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT\n)'
        expect(sql).toEqual(expected)
      })
    })

    describe('unsigned', () => {
      it('unsigned tinyint', async () => {
        table.unsignedTinyInteger('id')
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` TINYINT UNSIGNED\n)'
        expect(sql).toEqual(expected)
      })
      it('unsigned tinyint with custom length', async () => {
        table.unsignedTinyInteger('id', 2)
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` TINYINT(2) UNSIGNED\n)'
        expect(sql).toEqual(expected)
      })
      it('unsigned mediumint', async () => {
        table.unsignedMediumInteger('id')
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT UNSIGNED\n)'
        expect(sql).toEqual(expected)
      })
      it('unsigned mediumint with custom length', async () => {
        table.unsignedMediumInteger('id', 2)
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT(2) UNSIGNED\n)'
        expect(sql).toEqual(expected)
      })
      it('double', async () => {
        table.double('id')
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` DOUBLE\n)'
        expect(sql).toEqual(expected)
      })
    })

    describe('boolean', () => {
      it('boolean', async () => {
        table.boolean('is_active')
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `is_active` TINYINT(1)\n)'
        expect(sql).toEqual(expected)
      })
      it('boolean with default value', async () => {
        table.boolean('is_active', true)
        const sql = await table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `is_active` TINYINT(1) DEFAULT 1\n)'
        expect(sql).toEqual(expected)
      })
    })
  })

  describe('datetime columns', () => {
    it('year', async () => {
      table.year('created_at')
      const sql = await table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `created_at` YEAR\n)'
      expect(sql).toEqual(expected)
    })
  })

  describe('modifiers', () => {
    it('autoIncrement', async () => {
      table.integer('id', 255).autoIncrement().primary()
      const sql = await table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `id` INT(255) AUTO_INCREMENT PRIMARY KEY\n)'
      expect(sql).toEqual(expected)
    })
  })

  describe('timestamp', () => {
    it('timestamp with onUpdate CURRENT_TIMESTAMP', async () => {
      table.timestamp('created_at', 'CURRENT_TIMESTAMP')
        .onUpdate('CURRENT_TIMESTAMP')
      const sql = await table.toStatement()
      const expected = `CREATE TABLE \`users\` (\n  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP()\n)`
      expect(sql).toEqual(expected)
    })
    it('timestamp with onUpdate Date', async () => {
      const date = new Date('2025-01-01')
      table.timestamp('created_at', 'CURRENT_TIMESTAMP')
        .onUpdate(date)
      const sql = await table.toStatement()
      const expected = `CREATE TABLE \`users\` (\n  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE '${date.toISOString()}'\n)`
      expect(sql).toEqual(expected)
    })

    it('multiple primary keys', async () => {
      table.integer('id', 255).autoIncrement().primary()
      table.string('username').primary()
      const expected = `CREATE TABLE \`users\` (\n  \`id\` INT(255) AUTO_INCREMENT,\n  \`username\` VARCHAR(255),\nPRIMARY KEY(\`id\`, \`username\`)\n)`
      const sql = await table.toStatement()
      expect(sql).toEqual(expected)
    })

    it('shorthand multiple primary keys', async () => {
      table.integer('id')
      table.string('username')
      table.primaryKey(['id', 'username'])
      const expected = `CREATE TABLE \`users\` (\n  \`id\` INT,\n  \`username\` VARCHAR(255),\nPRIMARY KEY(\`id\`, \`username\`)\n)`
      const sql = await table.toStatement()
      expect(sql).toEqual(expected)
    })
  })
});
