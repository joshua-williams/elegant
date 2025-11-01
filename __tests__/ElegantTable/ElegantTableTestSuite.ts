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
      beforeAll(async () => {
        db = await Elegant.singleton(tableName)
      })
      beforeEach(async () => {
        table = new Table('users', 'create', db)
      })
      afterAll(async () => {
        await Elegant.disconnect(tableName)
      })

      it('string with default length', async () => {
        table.string('name')
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'name')} VARCHAR(255)\n)`
        expect(sql).toEqual(expected)
      })
      it('string with custom length', async () => {
        table.string('name', 100)
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'name')} VARCHAR(100)\n)`
        expect(sql).toEqual(expected)
      })
      it('char with default length', async () => {
        table.char('name')
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'name')} CHAR(255)\n)`
        expect(sql).toEqual(expected)
      })
      it('char with custom length', async () => {
        table.char('name', 100)
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName,'name')} CHAR(100)\n)`
        expect(sql).toEqual(expected)
      })
      it('text', async () => {
        table.text('description')
        const sql = table.toStatement()
        const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'description')} TEXT\n)`
        expect(sql).toEqual(expected)
      })
    })
  };
  const runNumberTestSuite = (Table:ElegantTableConstructor) => {

    describe(`${tableName} numeric columns`, async () => {
      let table:ElegantTable;
      let db:Elegant;

      beforeAll(async () => {
        db = await Elegant.singleton(tableName)
      })
      beforeEach(async () => {
        table = new Table('users', 'create', db)
      })
      afterAll(async () => {
        await Elegant.disconnect(tableName)
      })
      describe('signed', () => {

        it('smallint', async () => {
          table.smallInteger('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} SMALLINT\n)`
          expect(sql).toEqual(expected)
        })

        it('integer', async () => {
          table.integer('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName,'users')} (\n  ${enclose(tableName, 'id')} INT\n)`
          expect(sql).toEqual(expected)
        })
        it('bigInteger', async () => {
          table.bigInteger('id')
          const sql = table.toStatement()
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
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} SMALLINT UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned smallint with custom length', async () => {
          table.unsignedSmallInteger('id', 2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} SMALLINT(2) UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })

        it('unsigned integer', async () => {
          table.unsignedInteger('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned integer with custom length', async () => {
          table.unsignedInteger('id', 2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT(2) UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned bigInteger', async () => {
          table.unsignedBigInteger('id')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} BIGINT UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
        it('unsigned bigInteger with custom length', async () => {
          table.unsignedBigInteger('id', 2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} BIGINT(2) UNSIGNED\n)`
          expect(sql).toEqual(expected)
        })
      })

      describe('decimal', () => {
        it('decimal',  async () => {
          table.decimal('weight', 3,2)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'weight')} DECIMAL(3,2)\n)`
          expect(sql).toEqual(expected)
        })
        it('float', async () => {
          table.float('id')
          const sql = table.toStatement()
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
      beforeAll(async() => {
        db = await Elegant.singleton(tableName)
      })
      beforeEach(async () => {
        table = new Table('users', 'create', db)
      })
      afterAll(async () => {
        db = await Elegant.disconnect()
      })
      describe('timestamp columns', () => {
        it('timestamp', async () => {
          table.timestamp('created_at')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with CURRENT_TIMESTAMP as default value set in constructor', async () => {
          table.timestamp('created_at', 'CURRENT_TIMESTAMP')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with CURRENT_TIMESTAMP as default value set in "default" method', async () => {
          table.timestamp('created_at')
            .default('CURRENT_TIMESTAMP')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with Date as default value set in constructor', async () => {
          const date = new Date('2019-01-01')
          table.timestamp('created_at', date)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP DEFAULT '${date.toISOString()}'\n)`
          expect(sql).toEqual(expected)
        })
        it('timestamp with Date as default value set in "default" method', async () => {
          const date = new Date('2025-01-01')
          table.timestamp('created_at')
            .default(date)
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIMESTAMP DEFAULT '${date.toISOString()}'\n)`
          expect(sql).toEqual(expected)
        })
      })

      describe('time columns', () => {
        it('time', async () => {
          table.time('created_at')
          const sql = table.toStatement()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'created_at')} TIME\n)`
          expect(sql).toEqual(expected)
        })
        it('time with precision', async () => {
          table.time('created_at', undefined, 2)
          const sql = table.toStatement()
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
      beforeAll(async() => {
        db = await Elegant.singleton(tableName)
      })
      beforeEach(async () => {
        table = new Table('users', 'create', db)
      })
      afterAll(async () => {
        try {
          await Elegant.disconnect();
        } catch (err) {}
      })
      describe('primary key constraints', () => {
        it('multiple primary keys', async () => {
          table.integer('id').primary()
          table.string('username').primary()
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255),\nPRIMARY KEY(${enclose(tableName, 'id')}, ${enclose(tableName, 'username')})\n)`;
          const sql = table.toStatement()
          expect(sql).toEqual(expected)
        })
        it('shorthand multiple primary keys', async () => {
          table.integer('id')
          table.string('username')
          table.primary(['id', 'username'])
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255),\nPRIMARY KEY(${enclose(tableName, 'id')}, ${enclose(tableName, 'username')})\n)`;
          const sql = table.toStatement()
          expect(sql).toEqual(expected)
        })
      })

      describe.skip('foreign key constraint', () => {
        describe('shorthand key constraints', () => {
          /**
           * @deprecated this syntax should be replaced with basic inline foreign key syntax
           */
          it.skip('foreign key constraint shorthand inferred table name', async () => {
            table.integer('id').primary()
            table.integer('user_id')
            table.foreign('user_id')
            const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT PRIMARY KEY,\n  ${enclose(tableName, 'user_id')} INT,\n  CONSTRAINT ${enclose(tableName, 'fk_user_id')}\n    FOREIGN KEY (${enclose(tableName, 'user_id')})\n    REFERENCES ${enclose(tableName, 'users')}(${enclose(tableName, 'user_id')})\n)`;
            const sql =  table.toStatement()
            expect(sql).toEqual(expected)
          })
          it('foreign key constraint inline shorthand', async () => {
            table.integer('id').primary()
            table.integer('user_id').foreign()
            const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT PRIMARY KEY,\n  ${enclose(tableName, 'user_id')} INT,\n  CONSTRAINT ${enclose(tableName, 'fk_user_id')}\n    FOREIGN KEY (${enclose(tableName, 'user_id')})\n    REFERENCES ${enclose(tableName, 'users')}(${enclose(tableName, 'id')})\n)`;
            const sql = table.toStatement()
            expect(sql).toEqual(expected)
          })
          it('foreign key constraint shorthand separate declarations', async () => {
            table.integer('id').primary()
            table.integer('user_id')
            table.foreign('user_id', 'users')
            const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT PRIMARY KEY,\n  ${enclose(tableName, 'user_id')} INT,\n  CONSTRAINT ${enclose(tableName, 'fk_user_id')}\n    FOREIGN KEY (${enclose(tableName, 'user_id')})\n    REFERENCES ${enclose(tableName, 'users')}(${enclose(tableName, 'user_id')})\n)`;
            const sql = table.toStatement()
            expect(sql).toEqual(expected)
          })
        })

        it('foreign key constraint with single reference', async () => {
          table.integer('id')
          table.integer('image_id')
          table.string('username').primary()
          table.foreign('image_id').on('images').references('id')
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'id')} INT,\n  ${enclose(tableName, 'image_id')} INT,\n  ${enclose(tableName, 'username')} VARCHAR(255) PRIMARY KEY,\n  CONSTRAINT ${enclose(tableName, 'fk_image_id')}\n    FOREIGN KEY (${enclose(tableName, 'image_id')})\n    REFERENCES ${enclose(tableName, 'images')}(${enclose(tableName, 'id')})\n)`;
          const sql = table.toStatement()
          expect(sql).toEqual(expected)
        })
        it('composite foreign key constraint', async () => {
          table.integer('id')
          table.integer('image_id')
          table.string('image_name')
          table.string('username').primary()
          table.foreign(['image_id','image_name']).on('images').references(['id', 'name'])
          const sql = table.toStatement()
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
          const sql = table.toStatement()
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
          const sql = table.toStatement()
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
          const sql = table.toStatement()
          expect(sql).toEqual(expected)
        })
      })

      describe.skip('enum', () => {
        it('check string values', async () => {
          table.enum('role', ['admin', 'user', 'guest'])
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'role')} VARCHAR,\n  CONSTRAINT ${enclose(tableName, 'role_chk')} CHECK (${enclose(tableName, 'role')} IN ('admin', 'user', 'guest'))\n)`;
          const sql =  table.toStatement()
          expect(sql).toEqual(expected)
        })
        it('check numeric values', async () => {
          table.enum('product_id', [2011, 2006, 2004])
          const expected = `CREATE TABLE ${enclose(tableName, 'users')} (\n  ${enclose(tableName, 'product_id')} VARCHAR,\n  CONSTRAINT ${enclose(tableName, 'product_id_chk')} CHECK (${enclose(tableName, 'product_id')} IN (2011, 2006, 2004))\n)`;
          const sql = table.toStatement()
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

  function runAlterTableTestSuite(tableName:string, Table:ElegantTableConstructor) {
    describe(`${tableName}: Alter Table Test Suite`, () => {
      let table:ElegantTable;
      let db:Elegant;

      beforeAll(async function() {
        db = await Elegant.singleton(tableName)
      })
      afterAll(async function() {
        await Elegant.disconnect(tableName)
      })
      beforeEach(async function() {
        table = new Table('users', undefined, db)
      })

      it('should modify columns', () => {
        table.text('description').change()
        const sql = table.toStatement()
        const expected = `ALTER TABLE ${enclose(tableName, 'users')}\nMODIFY COLUMN ${enclose(tableName, 'description')} TEXT`
        expect(sql).toEqual(expected)
      })
      it('should drop columns', () => {
        table.dropColumn('description')
        const sql = table.toStatement()
        const expected = `ALTER TABLE ${enclose(tableName, 'users')}\nDROP COLUMN ${enclose(tableName, 'description')}`
        expect(sql).toEqual(expected)
      })
      it('should drop multiple columns', () => {
        table.dropColumn(['name', 'description'])
        const sql = table.toStatement()
        const expected = `ALTER TABLE ${enclose(tableName, 'users')}\nDROP COLUMN ${enclose(tableName, 'name')}\nDROP COLUMN ${enclose(tableName, 'description')}`
        expect(sql).toEqual(expected)
      })
      it('should drop column alternative syntax', () => {
        table.text('description').drop()
        const sql = table.toStatement()
        const expected = `ALTER TABLE ${enclose(tableName, 'users')}\nDROP COLUMN ${enclose(tableName, 'description')}`
        expect(sql).toEqual(expected)
      })
      it('should rename column', () => {
        table.renameColumn('name', 'first_name')
        const sql = table.toStatement()
        const expected = `ALTER TABLE ${enclose(tableName, 'users')}\nRENAME COLUMN ${enclose(tableName, 'name')} TO ${enclose(tableName, 'first_name')}`
        expect(sql).toEqual(expected)
      })
    })
  }
  runAlterTableTestSuite(tableName, Table)
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
        db = await Elegant.singleton(connection)
        schema = new Schema(db)
        schema.dropTable('users', (table) => table.ifExists())
        table = new Table('users', 'create', db)
        schema.createTable('users', (table) => {
          table.id('id')
          table.string('name')
          table.string('email').unique()
          table.string('city', 45)
          table.char('state', 2)
          table.timestamp('created_at')
        })
        await Promise.all(schema.$.executePromises)
      })

      afterAll(async () => {
        schema.dropTable('users', (table) => table.ifExists())
        await Promise.all(schema.$.executePromises)
        await Elegant.disconnect()
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
