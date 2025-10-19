import ElegantTable from '../../lib/schema/ElegantTable.js';
import {ElegantTableConstructor} from '../../types.js';
import Elegant from '../../src/Elegant.js';
import Schema from '../../src/Schema.js'
import ColumnDefinition from '../../lib/schema/ColumnDefinition.js';

const enclose = (dialect:string, value:string) => {
  switch(dialect.toLowerCase()) {
    case 'mysql':
    case 'mariadb': return `\`${value}\``
    case 'mssql': return `[${value}]`
    default: return `"${value}"`
  }
}

export const CreateTableTestSuite = (tableName:string, Table:ElegantTableConstructor) => {
  tableName = tableName.toLowerCase()

  const runStringTestSuite = (Table:ElegantTableConstructor) => {

    describe(`${tableName} string columns`, () => {
      let table:ElegantTable;
      let db:Elegant

      beforeEach(async () => {
        db = await Elegant.connection(tableName)
        table = new Table('users', 'create', db)
      })

      it('string with default length', async () => {
        table.string('name')
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'name')} VARCHAR(255)\n)`
        expect(sql).toEqual(expected)
      })
      it('string with custom length', async () => {
        table.string('name', 100)
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'name')} VARCHAR(100)\n)`
        expect(sql).toEqual(expected)
      })
      it('char with default length', async () => {
        table.char('name')
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'name')} CHAR(255)\n)`
        expect(sql).toEqual(expected)
      })
      it('char with custom length', async () => {
        table.char('name', 100)
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName,'name')} CHAR(100)\n)`
        expect(sql).toEqual(expected)
      })
      it('text', async () => {
        table.text('description')
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'description')} TEXT\n)`
        expect(sql).toEqual(expected)
      })
    })
  };
  const runNumberTestSuite = (Table:ElegantTableConstructor) => {
    describe(`${tableName} numeric columns`, async () => {
      let table:ElegantTable;
      let db:Elegant;

      beforeEach(async () => {
        db = await Elegant.connection(tableName)
        table = new Table('users', 'create', db)
      })
      describe('signed', () => {

        it('smallint', async () => {
          table.smallInteger('id')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} SMALLINT\n)`
          expect(sql).toEqual(expected)
        })

        it('integer', async () => {
          table.integer('id')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName,'users')} (\n  ${enclose(tableName, 'id')} INT\n)`
          expect(sql).toEqual(expected)
        })
        it('bigInteger', async () => {
          table.bigInteger('id')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} BIGINT\n)`
          expect(sql).toEqual(expected)
        })
      })

      describe('unsigned', () => {
        if (['postgres', 'sqlite'].includes(tableName.toLowerCase())) {
          it('not supported', () => {})
          return
        }
        it('unsigned smallint', async () => {
          table.unsignedSmallInteger('id')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} SMALLINT UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned smallint with custom length', async () => {
          table.unsignedSmallInteger('id', 2)
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} SMALLINT(2) UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })

        it('unsigned integer', async () => {
          table.unsignedInteger('id')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned integer with custom length', async () => {
          table.unsignedInteger('id', 2)
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT(2) UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned bigInteger', async () => {
          table.unsignedBigInteger('id')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} BIGINT UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned bigInteger with custom length', async () => {
          table.unsignedBigInteger('id', 2)
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} BIGINT(2) UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
      })

      describe('decimal', () => {
        it('decimal',  async () => {
          table.decimal('weight', 3,2)
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'weight')} DECIMAL(3,2)\n)`
          expect(sql).toEqual(expected)
        })
        it('float', async () => {
          table.float('id')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} FLOAT\n)`
          expect(sql).toEqual(expected)
        })
      })
    })

  }
  const runDateTimeTestSuite = (Table:ElegantTableConstructor) => {
    describe(`${tableName} timestamp columns`, () => {
      let table:ElegantTable;
      let db:Elegant;
      beforeEach(async () => {
        db = await Elegant.connection(tableName)
        table = new Table('users', 'create', db)
      })

      describe('timestamp columns', () => {
        it('timestamp', async () => {
          table.timestamp('created_at')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with CURRENT_TIMESTAMP as default value set in constructor', async () => {
          table.timestamp('created_at', 'CURRENT_TIMESTAMP')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with CURRENT_TIMESTAMP as default value set in "default" method', async () => {
          table.timestamp('created_at')
            .default('CURRENT_TIMESTAMP')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with Date as default value set in constructor', async () => {
          const date = new Date('2019-01-01')
          table.timestamp('created_at', date)
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP DEFAULT '${date.toISOString()}'\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with Date as default value set in "default" method', async () => {
          const date = new Date('2025-01-01')
          table.timestamp('created_at')
            .default(date)
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP DEFAULT '${date.toISOString()}'\n)`
          expect(sql).toEqual(expected)
        })
      })

      describe('time columns', () => {
        it('time', async () => {
          table.time('created_at')
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIME\n)`
          expect(sql).toEqual(expected)
        })
        it('time with precision', async () => {
          table.time('created_at', undefined, 2)
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIME(2)\n)`
          expect(sql).toEqual(expected)
        })
      })

    })
  }
  const runConstraintTestSuite = (Table:ElegantTableConstructor) => {
    describe(`${tableName} constraints`, () => {
      let table:ElegantTable;
      let db:Elegant;
      beforeEach(async () => {
        db = await Elegant.connection(tableName)
        table = new Table('users', 'create', db)
      })
      afterEach(async () => {
        await db.disconnect();
      })
      describe('primary key constraints', () => {
        it('multiple primary keys', async () => {
          table.integer('id').primary()
          table.string('username').primary()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255),\nPRIMARY KEY(${enclose(tableName, 'id')}, ${enclose(tableName, 'username')})\n)`;
          const sql = await table.toStatement()
          expect(sql).toEqual(expected)
        })
        it('shorthand multiple primary keys', async () => {
          table.integer('id')
          table.string('username')
          table.primary(['id', 'username'])
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255),\nPRIMARY KEY(${enclose(tableName, 'id')}, ${enclose(tableName, 'username')})\n)`;
          const sql = await table.toStatement()
          expect(sql).toEqual(expected)
        })
      })

      describe('foreign key constraint', () => {
        describe('shorthand key constraints', () => {
          it('foreign key constraint shorthand inferred table name', async () => {
            table.integer('id').primary()
            table.integer('user_id')
            table.foreign('user_id')
            const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT PRIMARY KEY,\n  ${enclose(tableName, 'user_id')} INT,\n  CONSTRAINT ${enclose(tableName, 'fk_user_id')}\n    FOREIGN KEY (${enclose(tableName, 'user_id')})\n    REFERENCES ${enclose(tableName, 'users')}(${enclose(tableName, 'user_id')})\n)`;
            const sql = await table.toStatement()
            expect(sql).toEqual(expected)
          })
          it('foreign key constraint shorthand', async () => {
            table.integer('id').primary()
            table.integer('user_id')
            table.foreign('user_id', 'users')
            const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT PRIMARY KEY,\n  ${enclose(tableName, 'user_id')} INT,\n  CONSTRAINT ${enclose(tableName, 'fk_user_id')}\n    FOREIGN KEY (${enclose(tableName, 'user_id')})\n    REFERENCES ${enclose(tableName, 'users')}(${enclose(tableName, 'user_id')})\n)`;
            const sql = await table.toStatement()
            expect(sql).toEqual(expected)
          })
        })

        it('foreign key constraint with single reference', async () => {
          table.integer('id')
          table.integer('image_id')
          table.string('username').primary()
          table.foreign('image_id').on('images').references('id')
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'image_id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255) PRIMARY KEY,\n  CONSTRAINT ${enclose(tableName, 'fk_image_id')}\n    FOREIGN KEY (${enclose(tableName, 'image_id')})\n    REFERENCES ${enclose(tableName, 'images')}(${enclose(tableName, 'id')})\n)`;
          const sql = await table.toStatement()
          expect(sql).toEqual(expected)
        })
        it('foreign key constraint with multiple references', async () => {
          table.integer('id')
          table.integer('image_id')
          table.string('image_name')
          table.string('username').primary()
          table.foreign(['image_id','image_name']).on('images').references(['id', 'name'])
          const sql = await table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'image_id')} INT,\n  ${enclose(tableName, 'image_name')} VARCHAR(255),\n  ${enclose(tableName, 'username')} VARCHAR(255) PRIMARY KEY,\n  CONSTRAINT ${enclose(tableName, 'fk_image_id_image_name')}\n    FOREIGN KEY (${enclose(tableName, 'image_id')}, ${enclose(tableName, 'image_name')})\n    REFERENCES ${enclose(tableName, 'images')}(${enclose(tableName, 'id')}, ${enclose(tableName, 'name')})\n)`;
          expect(sql).toEqual(expected)
        })
        it('foreign key with onDelete action', async () => {
          table.integer('id')
          table.integer('image_id')
          table.string('username')
          table.foreign('image_id')
            .on('images')
            .references('id')
            .onDelete('CASCADE')
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'image_id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255),\n  CONSTRAINT ${enclose(tableName, 'fk_image_id')}\n    FOREIGN KEY (${enclose(tableName, 'image_id')})\n    REFERENCES ${enclose(tableName, 'images')}(${enclose(tableName, 'id')})\n    ON DELETE CASCADE\n)`;
          const sql = await table.toStatement()
          expect(sql).toEqual(expected)
        })
        it('foreign key with onUpdate action', async () => {
          table.integer('id')
          table.integer('image_id')
          table.string('username')
          table.foreign('image_name')
            .on('images')
            .references('name')
            .onUpdate('CASCADE')
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'image_id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255),\n  CONSTRAINT ${enclose(tableName, 'fk_image_name')}\n    FOREIGN KEY (${enclose(tableName, 'image_name')})\n    REFERENCES ${enclose(tableName, 'images')}(${enclose(tableName, 'name')})\n    ON UPDATE CASCADE\n)`;
          const sql = await table.toStatement()
          expect(sql).toEqual(expected)
        })
        it('foreign key with onUpdate and onDelete action', async () => {
          table.integer('id')
          table.integer('image_id')
          table.string('username')
          table.foreign('image_id')
            .on('images')
            .references('id')
            .onUpdate('CASCADE')
            .onDelete('CASCADE')
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'image_id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255),\n  CONSTRAINT ${enclose(tableName, 'fk_image_id')}\n    FOREIGN KEY (${enclose(tableName, 'image_id')})\n    REFERENCES ${enclose(tableName, 'images')}(${enclose(tableName, 'id')})\n    ON UPDATE CASCADE\n    ON DELETE CASCADE\n)`;
          const sql = await table.toStatement()
          expect(sql).toEqual(expected)
        })
      })

      describe('enum', () => {
        it('check string values', async () => {
          table.enum('role', ['admin', 'user', 'guest'])
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'role')} VARCHAR,\n  CONSTRAINT ${enclose(tableName, 'role_chk')} CHECK (${enclose(tableName, 'role')} IN ('admin', 'user', 'guest'))\n)`;
          const sql = await table.toStatement()
          expect(sql).toEqual(expected)
        })
        it('check numeric values', async () => {
          table.enum('product_id', [2011, 2006, 2004])
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'product_id')} VARCHAR,\n  CONSTRAINT ${enclose(tableName, 'product_id_chk')} CHECK (${enclose(tableName, 'product_id')} IN (2011, 2006, 2004))\n)`;
          const sql = await table.toStatement()
          expect(sql).toEqual(expected)
        })
      })
    })
  }
  runStringTestSuite(Table)
  runNumberTestSuite(Table)
  runDateTimeTestSuite(Table)
  runConstraintTestSuite(Table)
}

export const AlterTableTestSuite = (tableName:string, Table:ElegantTableConstructor) => {
  tableName = tableName.toLowerCase()

  const runStringTestSuite = (Table:ElegantTableConstructor) => {
    describe(`${tableName} string columns`, () => {
      let table:ElegantTable;
      let db:Elegant;

      beforeEach(async () => {
        db = await Elegant.connection(tableName)
        table = new Table('users', 'alter', db)
      })

      it('string with default length', async () => {
        table.string('name')
        const sql = await table.toStatement()
        const expected = `ALTER TABLE ${enclose(tableName, 'users')} ADD ${enclose(tableName, 'tableName')} VARCHAR(255)`
        expect(sql).toEqual(expected)
      })

      it('string with custom length', async () => {
        table.string('name', 100)
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'tableName')} VARCHAR(100)\n)`
        expect(sql).toEqual(expected)
      })
      it('char with default length', async () => {
        table.char('name')
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'tableName')} CHAR(255)\n)`
        expect(sql).toEqual(expected)
      })
      it('char with custom length', async () => {
        table.char('name', 100)
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName,'tableName')} CHAR(100)\n)`
        expect(sql).toEqual(expected)
      })
      it('text', async () => {
        table.text('description')
        const sql = await table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'description')} TEXT\n)`
        expect(sql).toEqual(expected)
      })

    })
  }
  const runNumberTestSuite = (Table:ElegantTableConstructor) => {}
  const runDateTimeTestSuite = (Table:ElegantTableConstructor) => {}
  runStringTestSuite(Table)
  runNumberTestSuite(Table)
  runDateTimeTestSuite(Table)
}

export const GetDatabaseColumnsTestSuite = (connection:string, Table:ElegantTableConstructor) => {

  function runGetDatabaseColumnsTestSuite(Table:ElegantTableConstructor) {
    connection = connection.toLowerCase()

    describe(`${connection} columns`, () => {
      let table:ElegantTable;
      let db:Elegant;
      let schema:Schema;
      let columns:ColumnDefinition[];

      beforeAll(async () => {
        db = await Elegant.connection(connection)
        schema = new Schema(db)
        await schema.drop('users', (table) => table.ifExists())
        table = new Table('users', 'create', db)
        await schema.create('users', (table) => {
          table.id('id')
          table.string('name')
          table.string('email').unique()
          table.string('city', 45)
          table.char('state', 2)
          table.timestamp('created_at')
        })
      })

      afterAll(async () => {
        await schema.drop('users')
        await db.disconnect()
      })

      it('should retrieve columns for table', async () => {
        columns = await (table as any).getDatabaseColumns()
        expect(columns).toHaveLength(6)
      })
      it('should retrieve id column', () => {
        let column = columns.find((column) => column.name === 'id')
        expect(column).toBeDefined()
        expect(column.type).toEqual('int')
        expect(column.$.primary).toBe(true)
        if (['mysql','mariadb'].includes(connection)) expect(column.$.unsigned).toBe(true)
      })
      it('should retrieve name column', () => {
        let column = columns.find((column) => column.name === 'name')
        expect(column).toBeDefined()
        expect(column.type).toEqual('varchar(255)')
      })
      it('should retrieve email column', () => {
        let column = columns.find((column) => column.name === 'email')
        expect(column).toBeDefined()
        expect(column.type).toEqual('varchar(255)')
        expect(column.$.length).toBe(255)
        expect(column.$.unique).toBe(true)
      })
      it('should retrieve city column', () => {
        let column = columns.find((column) => column.name === 'city')
        expect(column).toBeDefined()
        expect(column.type).toEqual('varchar(45)')
        expect(column.$.length).toBe(45)
      })
      it('should retrieve state column', () => {
        let column = columns.find((column) => column.name === 'state')
        expect(column).toBeDefined()
        expect(column.type).toEqual('char(2)')
        expect(column.$.length).toBe(2)
      })
      it('should retrieve created_at column', () => {
        let column = columns.find((column) => column.name === 'created_at')
        expect(column).toBeDefined()
        expect(column.type).toEqual('timestamp')
      })
    })

  }

  runGetDatabaseColumnsTestSuite(Table)
}
