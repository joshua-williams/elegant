import SchemaTable from '../src/schema/schema-table';
import {basePath} from '../lib/util';
import {SchemaDialect} from '../types';

describe('schema-table', () => {

  const runTest = (dialect: SchemaDialect) => {
    describe(`${dialect} dialect`, () => {
      let table:SchemaTable;

      beforeEach(async () => {
        const configPath = basePath('__tests__/app/elegant.config.js')
        const config = await import(configPath)
        table = new SchemaTable('users', dialect)
      })

      describe('string columns', () => {
        it('string with default length', () => {
          table.string('name')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `name` VARCHAR(255) NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('string with custom length', () => {
          table.string('name', 100)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `name` VARCHAR(100) NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('char with default length', () => {
          table.char('name')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `name` CHAR(255) NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('char with custom length', () => {
          table.char('name', 100)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `name` CHAR(100) NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('mediumText', () => {
          table.mediumText('description')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `description` MEDIUMTEXT NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('text', () => {
          table.text('description')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `description` TEXT NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('longText', () => {
          table.longText('description')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `description` LONGTEXT NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
      })

      describe('numeric columns', () => {
        describe('signed', () => {
          it('tinyint', () => {
            table.tinyInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` TINYINT NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('smallint', () => {
            table.smallInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` SMALLINT NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('mediumint', () => {
            table.mediumInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('integer', () => {
            table.integer('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` INT NOT NULL\n)'
          })
          it('bigInteger', () => {
            table.bigInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` BIGINT NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
        })

        describe('unsigned', () => {
          it('unsigned tinyint', () => {
            table.unsignedTinyInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` TINYINT UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned tinyint with custom length', () => {
            table.unsignedTinyInteger('id', 2)
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` TINYINT(2) UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned smallint', () => {
            table.unsignedSmallInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` SMALLINT UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned smallint with custom length', () => {
            table.unsignedSmallInteger('id', 2)
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` SMALLINT(2) UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned mediumint', () => {
            table.unsignedMediumInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned mediumint with custom length', () => {
            table.unsignedMediumInteger('id', 2)
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` MEDIUMINT(2) UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned integer', () => {
            table.unsignedInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` INT UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned integer with custom length', () => {
            table.unsignedInteger('id', 2)
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` INT(2) UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned bigInteger', () => {
            table.unsignedBigInteger('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` BIGINT UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('unsigned bigInteger with custom length', () => {
            table.unsignedBigInteger('id', 2)
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` BIGINT(2) UNSIGNED NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
        })

        describe('decimal', () => {
          it('decimal', () => {
            table.decimal('weight', 3,2)
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `weight` DECIMAL(3,2) NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('float', () => {
            table.float('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` FLOAT NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
          it('double', () => {
            table.double('id')
            const sql = table.toSql()
            const expected = 'CREATE TABLE `users` (\n  `id` DOUBLE NOT NULL\n)'
            expect(sql).toEqual(expected)
          })
        })
      })

      describe('boolean columns', () => {
        it('boolean', () => {
          table.boolean('is_active')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `is_active` TINYINT(1) NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('boolean with default value', () => {
          table.boolean('is_active', true)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `is_active` TINYINT(1) NOT NULL DEFAULT 1\n)'
          expect(sql).toEqual(expected)
        })
      })

      describe('timestamp columns', () => {
        it('timestamp', () => {
          table.timestamp('created_at')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIMESTAMP NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('timestamp with CURRENT_TIMESTAMP as default value set in constructor', () => {
          table.timestamp('created_at', 'CURRENT_TIMESTAMP')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n)'
          expect(sql).toEqual(expected)
        })
        it('timestamp with CURRENT_TIMESTAMP as default value set in "default" method', () => {
          table.timestamp('created_at')
            .default('CURRENT_TIMESTAMP')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n)'
          expect(sql).toEqual(expected)
        })
        it('timestamp with Date as default value set in constructor', () => {
          const date = new Date('2019-01-01')
          table.timestamp('created_at', date)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIMESTAMP NOT NULL DEFAULT \'2019-01-01T00:00:00.000Z\'\n)'
          expect(sql).toEqual(expected)
        })
        it('timestamp with Date as default value set in "default" method', () => {
          const date = new Date('2025-01-01')
          table.timestamp('created_at')
            .default(date)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIMESTAMP NOT NULL DEFAULT \'2025-01-01T00:00:00.000Z\'\n)'
          expect(sql).toEqual(expected)
        })
        it('timestamp with onUpdate CURRENT_TIMESTAMP', () => {
          table.timestamp('created_at', 'CURRENT_TIMESTAMP')
            .onUpdate('CURRENT_TIMESTAMP')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n)'
          expect(sql).toEqual(expected)
        })
        it('timestamp with onUpdate Date', () => {
          const date = new Date('2025-01-01')
          table.timestamp('created_at', 'CURRENT_TIMESTAMP')
            .onUpdate(date)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE \'2025-01-01T00:00:00.000Z\'\n)'
          expect(sql).toEqual(expected)
        })
      })

      describe('datetime columns', () => {
        it('datetime', () => {
          table.dateTime('created_at')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` DATETIME NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('datetime with CURRENT_TIMESTAMP as default value set in constructor', () => {
          table.dateTime('created_at', 'CURRENT_TIMESTAMP')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP\n)'
          expect(sql).toEqual(expected)
        })
        it('datetime with CURRENT_TIMESTAMP as default value set in "default" method', () => {
          table.dateTime('created_at')
            .default('CURRENT_TIMESTAMP')
          const sql = table.toSql()
        })
        it('datetime with Date as default value set in constructor', () => {
          const date = new Date('2019-01-01')
          table.dateTime('created_at', date)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` DATETIME NOT NULL DEFAULT \'2019-01-01T00:00:00.000Z\'\n)'
          expect(sql).toEqual(expected)
        })
        it('datetime with Date as default value set in "default" method', () => {
          const date = new Date('2025-01-01')
          table.dateTime('created_at')
            .default(date)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` DATETIME NOT NULL DEFAULT \'2025-01-01T00:00:00.000Z\'\n)'
        })
      })

      describe('year columns', () => {
        it('year', () => {
          table.year('created_at')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` YEAR NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
      })

      describe('time columns', () => {
        it('time', () => {
          table.time('created_at')
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIME NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
        it('time with precision', () => {
          table.time('created_at', 2)
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `created_at` TIME(2) NOT NULL\n)'
          expect(sql).toEqual(expected)
        })
      })

      describe('modifiers', () => {
        it('autoIncrement', () => {
          table.integer('id', 255).autoIncrement().primary()
          const sql = table.toSql()
          const expected = 'CREATE TABLE `users` (\n  `id` INT(255) NOT NULL AUTO_INCREMENT PRIMARY KEY\n)'
          expect(sql).toEqual(expected)
        })
      })
    })
  }

  runTest('mysql')
  runTest('mariadb')

});
