import SchemaTable from '../../lib/schema/SchemaTable';
import {SchemaTableConstructor} from '../../types';
import {exit} from '../../lib/util';

export const runStringTestSuite = (name:string, Table:SchemaTableConstructor) => {
  const enclose = (value:string) => {
    switch(name) {
      case 'Postgres': return `"${value}"`
      case 'MySQL':
      case 'MariaDB': return `\`${value}\``
      default: exit('Unsupported dialect')
    }
  }
  describe(`${name} string columns`, () => {
    let table:SchemaTable;

    beforeEach(() => {
      table = new Table('users')
    })

    it('string with default length', () => {
      table.string('name')
      const sql = table.toCreateStatement()
      const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('name')} VARCHAR(255) NOT NULL\n)`
      // const expected = 'CREATE TABLE `users` (\n  `name` VARCHAR(255) NOT NULL\n)'
      expect(sql).toEqual(expected)
    })
    it('string with custom length', () => {
      table.string('name', 100)
      const sql = table.toCreateStatement()
      const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('name')} VARCHAR(100) NOT NULL\n)`
      expect(sql).toEqual(expected)
    })
    it('char with default length', () => {
      table.char('name')
      const sql = table.toCreateStatement()
      const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('name')} CHAR(255) NOT NULL\n)`
      expect(sql).toEqual(expected)
    })
    it('char with custom length', () => {
      table.char('name', 100)
      const sql = table.toCreateStatement()
      const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('name')} CHAR(100) NOT NULL\n)`
      expect(sql).toEqual(expected)
    })
    it('text', () => {
      table.text('description')
      const sql = table.toCreateStatement()
      const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('description')} TEXT NOT NULL\n)`
      expect(sql).toEqual(expected)
    })
  })
};

export const runNumberTestSuite = (name:string, Table:SchemaTableConstructor) => {
  const enclose = (value:string) => {
    switch(name) {
      case 'Postgres': return `"${value}"`
      case 'MySQL':
      case 'MariaDB': return `\`${value}\``
      default: exit('Unsupported dialect')
    }
  }
  describe(`${name} numeric columns`, () => {
    let table:SchemaTable;

    beforeEach(() => {
      table = new Table('users')
    })
    describe('signed', () => {

      it('smallint', () => {
        table.smallInteger('id')
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} SMALLINT NOT NULL\n)`
        // const expected = 'CREATE TABLE `users` (\n  `id` SMALLINT NOT NULL\n)'
        expect(sql).toEqual(expected)
      })

      it('integer', () => {
        table.integer('id')
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE \`users\` (\n  ${enclose('id')} INT NOT NULL\n)`
      })
      it('bigInteger', () => {
        table.bigInteger('id')
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} BIGINT NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
    })

    describe('unsigned', () => {

      it('unsigned smallint', () => {
        table.unsignedSmallInteger('id')
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} SMALLINT UNSIGNED NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('unsigned smallint with custom length', () => {
        table.unsignedSmallInteger('id', 2)
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} SMALLINT(2) UNSIGNED NOT NULL\n)`
        expect(sql).toEqual(expected)
      })

      it('unsigned integer', () => {
        table.unsignedInteger('id')
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} INT UNSIGNED NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('unsigned integer with custom length', () => {
        table.unsignedInteger('id', 2)
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} INT(2) UNSIGNED NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('unsigned bigInteger', () => {
        table.unsignedBigInteger('id')
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} BIGINT UNSIGNED NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('unsigned bigInteger with custom length', () => {
        table.unsignedBigInteger('id', 2)
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} BIGINT(2) UNSIGNED NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
    })

    describe('decimal', () => {
      it('decimal', () => {
        table.decimal('weight', 3,2)
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('weight')} DECIMAL(3,2) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('float', () => {
        table.float('id')
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('id')} FLOAT NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
    })

  })

}

export const runDateTimeTestSuite = (name:string, Table:SchemaTableConstructor) => {
  const enclose = (value:string) => {
    switch(name) {
      case 'Postgres': return `"${value}"`
      case 'MySQL':
      case 'MariaDB': return `\`${value}\``
      default: exit('Unsupported dialect')
    }
  }
  describe(`${name} timestamp columns`, () => {
    let table:SchemaTable;

    beforeEach(() => {
      table = new Table('users')
    })

   describe('timestamp columns', () => {
     it('timestamp', () => {
       table.timestamp('created_at')
       const sql = table.toCreateStatement()
       const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIMESTAMP NOT NULL\n)`
       expect(sql).toEqual(expected)
     })
     it('timestamp with CURRENT_TIMESTAMP as default value set in constructor', () => {
       table.timestamp('created_at', 'CURRENT_TIMESTAMP')
       const sql = table.toCreateStatement()
       const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n)`
       expect(sql).toEqual(expected)
     })
     it('timestamp with CURRENT_TIMESTAMP as default value set in "default" method', () => {
       table.timestamp('created_at')
         .default('CURRENT_TIMESTAMP')
       const sql = table.toCreateStatement()
       const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP\n)`
       expect(sql).toEqual(expected)
     })
     it('timestamp with Date as default value set in constructor', () => {
       const date = new Date('2019-01-01')
       table.timestamp('created_at', date)
       const sql = table.toCreateStatement()
       const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIMESTAMP NOT NULL DEFAULT '${date.toISOString()}'\n)`
       expect(sql).toEqual(expected)
     })
     it('timestamp with Date as default value set in "default" method', () => {
       const date = new Date('2025-01-01')
       table.timestamp('created_at')
         .default(date)
       const sql = table.toCreateStatement()
       const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIMESTAMP NOT NULL DEFAULT '${date.toISOString()}'\n)`
       expect(sql).toEqual(expected)
     })
     it('timestamp with onUpdate CURRENT_TIMESTAMP', () => {
       table.timestamp('created_at', 'CURRENT_TIMESTAMP')
         .onUpdate('CURRENT_TIMESTAMP')
       const sql = table.toCreateStatement()
       const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP\n)`
       expect(sql).toEqual(expected)
     })
     it('timestamp with onUpdate Date', () => {
       const date = new Date('2025-01-01')
       table.timestamp('created_at', 'CURRENT_TIMESTAMP')
         .onUpdate(date)
       const sql = table.toCreateStatement()
       const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE '${date.toISOString()}'\n)`
       expect(sql).toEqual(expected)
     })
   })

   describe('time columns', () => {
      it('time', () => {
        table.time('created_at')
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIME NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
      it('time with precision', () => {
        table.time('created_at', undefined, 2)
        const sql = table.toCreateStatement()
        const expected = `CREATE TABLE ${enclose('users')} (\n  ${enclose('created_at')} TIME(2) NOT NULL\n)`
        expect(sql).toEqual(expected)
      })
    })

  })
}
