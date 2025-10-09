import ElegantTable from '../../lib/schema/ElegantTable';
import {ElegantTableConstructor} from '../../types';
import Elegant from '../../src/Elegant';

const setup = async (name:string) => {
  const query = `DROP TABLE IF EXISTS ${enclose(name, 'users')};`
  const db = await Elegant.connection(name.toLowerCase())
  await db.query(query)
  await db.query(`
    CREATE TABLE ${enclose(name, 'users')} (
      id INT NOT NULL PRIMARY KEY,
      ${enclose(name, 'first_name')} VARCHAR(255) NOT NULL
     )
  `)
  await db.close()

}
const enclose = (name:string, value:string) => {
  switch(name) {
    case 'MySQL':
    case 'MariaDB': return `\`${value}\``
    case 'MSSQL': return `[${value}]`
    default: return `"${value}"`
  }
}
export const CreateTableTestSuite = (name, Table:ElegantTableConstructor) => {
  const runStringTestSuite = (name:string, Table:ElegantTableConstructor) => {

    describe(`${name} string columns`, () => {
      let table:ElegantTable;

      beforeEach(() => {
        table = new Table('users', 'create')
      })

      it('string with default length', () => {
        table.string('name')
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'name')} VARCHAR(255) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('string with custom length', () => {
        table.string('name', 100)
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'name')} VARCHAR(100) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('char with default length', () => {
        table.char('name')
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'name')} CHAR(255) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('char with custom length', () => {
        table.char('name', 100)
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name,'name')} CHAR(100) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('text', () => {
        table.text('description')
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'description')} TEXT NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
    })
  };
  const runNumberTestSuite = (name:string, Table:ElegantTableConstructor) => {
    describe(`${name} numeric columns`, () => {
      let table:ElegantTable;

      beforeEach(() => {
        table = new Table('users', 'create')
      })
      describe('signed', () => {

        it('smallint', () => {
          table.smallInteger('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} SMALLINT NOT NULL\n)`
          expect(sql).toEqual(expected)
        })

        it('integer', () => {
          table.integer('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name,'users')} (\n  ${enclose(name, 'id')} INT NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
        it('bigInteger', () => {
          table.bigInteger('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} BIGINT NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
      })

      describe('unsigned', () => {

        it('unsigned smallint', () => {
          table.unsignedSmallInteger('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} SMALLINT UNSIGNED NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned smallint with custom length', () => {
          table.unsignedSmallInteger('id', 2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} SMALLINT(2) UNSIGNED NOT NULL\n)`
          expect(sql).toEqual(expected)
        })

        it('unsigned integer', () => {
          table.unsignedInteger('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} INT UNSIGNED NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned integer with custom length', () => {
          table.unsignedInteger('id', 2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} INT(2) UNSIGNED NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned bigInteger', () => {
          table.unsignedBigInteger('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} BIGINT UNSIGNED NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned bigInteger with custom length', () => {
          table.unsignedBigInteger('id', 2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} BIGINT(2) UNSIGNED NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
      })

      describe('decimal', () => {
        it('decimal', () => {
          table.decimal('weight', 3,2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'weight')} DECIMAL(3,2) NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
        it('float', () => {
          table.float('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'id')} FLOAT NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
      })
    })

  }
  const runDateTimeTestSuite = (name:string, Table:ElegantTableConstructor) => {
    describe(`${name} timestamp columns`, () => {
      let table:ElegantTable;

      beforeEach(() => {
        table = new Table('users', 'create')
      })

      describe('timestamp columns', () => {
        it('timestamp', () => {
          table.timestamp('created_at')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIMESTAMP NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with CURRENT_TIMESTAMP as default value set in constructor', () => {
          table.timestamp('created_at', 'CURRENT_TIMESTAMP')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with CURRENT_TIMESTAMP as default value set in "default" method', () => {
          table.timestamp('created_at')
            .default('CURRENT_TIMESTAMP')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with Date as default value set in constructor', () => {
          const date = new Date('2019-01-01')
          table.timestamp('created_at', date)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIMESTAMP NOT NULL DEFAULT '${date.toISOString()}'\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with Date as default value set in "default" method', () => {
          const date = new Date('2025-01-01')
          table.timestamp('created_at')
            .default(date)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIMESTAMP NOT NULL DEFAULT '${date.toISOString()}'\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with onUpdate CURRENT_TIMESTAMP', () => {
          table.timestamp('created_at', 'CURRENT_TIMESTAMP')
            .onUpdate('CURRENT_TIMESTAMP')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with onUpdate Date', () => {
          const date = new Date('2025-01-01')
          table.timestamp('created_at', 'CURRENT_TIMESTAMP')
            .onUpdate(date)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE '${date.toISOString()}'\n)`
          expect(sql).toEqual(expected)
        })
      })

      describe('time columns', () => {
        it('time', () => {
          table.time('created_at')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIME NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
        it('time with precision', () => {
          table.time('created_at', undefined, 2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'created_at')} TIME(2) NOT NULL\n)`
          expect(sql).toEqual(expected)
        })
      })

    })
  }
  runStringTestSuite(name, Table)
  runNumberTestSuite(name, Table)
  runDateTimeTestSuite(name, Table)
}

export const AlterTableTestSuite = (name, Table:ElegantTableConstructor) => {
  const runStringTestSuite = (name:string, Table:ElegantTableConstructor) => {
    describe(`${name} string columns`, () => {
      let table:ElegantTable;

      beforeAll(async () => {

      })

      beforeEach(() => {
        table = new Table('users', 'create')
      })

      it('string with default length', () => {
        table.string('name')
        const sql = table.toStatement()
        const expected = `ALTER TABLE ${enclose(name, 'users')} ADD ${enclose(name, 'name')} VARCHAR(255) NOT NULL`
        // const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'name')} VARCHAR(255) NOT NULL\n)`
        // expect(sql).toEqual(expected)
      })
      it.skip('string with custom length', () => {
        table.string('name', 100)
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'name')} VARCHAR(100) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it.skip('char with default length', () => {
        table.char('name')
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'name')} CHAR(255) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it.skip('char with custom length', () => {
        table.char('name', 100)
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name,'name')} CHAR(100) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it.skip('text', () => {
        table.text('description')
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(name, 'users')} (\n  ${enclose(name, 'description')} TEXT NOT NULL\n)`
        expect(sql).toEqual(expected)
      })

    })
  }
  const runNumberTestSuite = (name:string, Table:ElegantTableConstructor) => {}
  const runDateTimeTestSuite = (name:string, Table:ElegantTableConstructor) => {}
  runStringTestSuite(name, Table)
  runNumberTestSuite(name, Table)
  runDateTimeTestSuite(name, Table)
}

