import MysqlTable from '../../lib/schema/MysqlTable';

describe('MysqlTable', () => {
  let table:MysqlTable;

  beforeEach(() => {
    table = new MysqlTable('users', 'create')
  })

  describe('string columns', () => {
    it('mediumText', () => {
      table.mediumText('description')
      const sql = table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `description` MEDIUMTEXT NOT NULL\n)'
      expect(sql).toEqual(expected)
    })
    it('longText', () => {
      table.longText('description')
      const sql = table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `description` LONGTEXT NOT NULL\n)'
      expect(sql).toEqual(expected)
    })
  })

  describe('numeric columns', () => {

    describe('signed', () => {
      it('tinyint', () => {
        table.tinyInteger('id')
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` TINYINT NOT NULL\n)'
        expect(sql).toEqual(expected)
      })
      it('mediumint', () => {
        table.mediumInteger('id')
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT NOT NULL\n)'
        expect(sql).toEqual(expected)
      })
    })

    describe('unsigned', () => {
      it('unsigned tinyint', () => {
        table.unsignedTinyInteger('id')
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` TINYINT UNSIGNED NOT NULL\n)'
        expect(sql).toEqual(expected)
      })
      it('unsigned tinyint with custom length', () => {
        table.unsignedTinyInteger('id', 2)
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` TINYINT(2) UNSIGNED NOT NULL\n)'
        expect(sql).toEqual(expected)
      })
      it('unsigned mediumint', () => {
        table.unsignedMediumInteger('id')
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT UNSIGNED NOT NULL\n)'
        expect(sql).toEqual(expected)
      })
      it('unsigned mediumint with custom length', () => {
        table.unsignedMediumInteger('id', 2)
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT(2) UNSIGNED NOT NULL\n)'
        expect(sql).toEqual(expected)
      })
      it('double', () => {
        table.double('id')
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `id` DOUBLE NOT NULL\n)'
        expect(sql).toEqual(expected)
      })
    })

    describe('boolean', () => {
      it('boolean', () => {
        table.boolean('is_active')
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `is_active` TINYINT(1) NOT NULL\n)'
        expect(sql).toEqual(expected)
      })
      it('boolean with default value', () => {
        table.boolean('is_active', true)
        const sql = table.toStatement()
        const expected = 'CREATE TABLE `users` (\n  `is_active` TINYINT(1) NOT NULL DEFAULT 1\n)'
        expect(sql).toEqual(expected)
      })
    })
  })

  describe('datetime columns', () => {
    it('year', () => {
      table.year('created_at')
      const sql = table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `created_at` YEAR NOT NULL\n)'
      expect(sql).toEqual(expected)
    })
  })

  describe('modifiers', () => {
    it('autoIncrement', () => {
      table.integer('id', 255).autoIncrement().primary()
      const sql = table.toStatement()
      const expected = 'CREATE TABLE `users` (\n  `id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY\n)'
      expect(sql).toEqual(expected)
    })
  })

});
