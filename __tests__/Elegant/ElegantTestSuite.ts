import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest'
import {SchemaDialect} from '../../types.js';
import Elegant from '../../src/Elegant.js';
import Schema from '../../src/Schema.js';
import ElegantTable from '../../lib/schema/ElegantTable.js';

export const ElegantTestSuite = (connection:SchemaDialect) => {
  let db: Elegant;
  let schema:Schema;

  describe(`Elegant: ${connection}`, () => {

    beforeAll(async () => {
      db = await Elegant.connection(connection)
      schema = new Schema(db)

      await schema.drop('users', (table) => table.ifExists())
      const createUserTable = (table:ElegantTable) => {
        table.id()
        table.string('name')
        table.string('email').unique()
        table.string('password')
        table.string('phone')
        table.string('address')
        table.string('city', 45)
        table.char('state', 2)
        table.char('zip', 5)
        table.char('country', 2)
        table.ifNotExists();
      }
      await schema.create('users', createUserTable)
    })

    afterAll(async () => {
      await schema.drop('users', (table) => table.ifExists())
    })

    beforeEach(async () => {
      db = await Elegant.connection(connection)
    })

    afterEach(async () => {
      await db.close()
    })

    it('should get Elegant instance', () => {
      expect(db).toBeInstanceOf(Elegant);
    })
    describe('insert', () => {
      it('should insert', async () => {
        const email = Math.random().toString(36).substring(7) + '@gmail.com'
        const password = Math.random().toString(36).substring(7)
        const query = `insert into users (name, email, password, phone) values (${p(4)})`
        return db.insert(query, ['test',email, password, '555-555-5555'])
          .then(res => {
            expect(typeof res).toBe('number')
          })
      })
    })

    describe('select', () => {
      it('should select', async () => {
        const users = await db.select('select * from users')
        expect(users).toBeInstanceOf(Array)
        expect(users).toHaveLength(1)
      })
      it('should select with generic return type', async () => {
        class User {firstName:string; lastName:string}
        const users:User[] = await db.select<User>('select * from users')
        expect(users).toHaveLength(1)
      })
    })

    describe('query', () => {
      it('should query', async () => {
        class User {firstName:string; lastName:string}
        const users:User[] = await db.query('select * from users')
        expect(users).toBeInstanceOf(Array)
        expect(users.length).toEqual(1)
        expect(users).toHaveLength(1)
      })
      it('should query with generic return type', async () => {
        class User {name:string; email:string}
        const users:User[] = await db.query<User>('select * from users')
        expect(users).toBeInstanceOf(Array)
        expect(users.length).toEqual(1)
      })
      it('should query with parameters', async () => {
        const users:any[] = await db.query(`select * from users where name = ${p(1)}`, ['test'])
        expect(users).toBeInstanceOf(Array)
        expect(users).toHaveLength(1)
        expect(users[0].name).toBe('test')
      })
    })

    describe('scalar', () => {
      it('should select scalar', async () => {
        const count = await db.scalar('select count(*) as count from users')
        expect(count).toBe(1)
        expect(typeof count).toBe('number')
      })
      it('should select scalar with generic return type', async () => {
        const count = await db.scalar<number>('select count(*) from users')
        expect(count).toBe(1)
        expect(typeof count).toBe('number')
      })
      it('should select scalar with parameters and generic return type', async () => {
        const name = await db.scalar<string>(`select name from users where name = ${p(1)}`, ['test'])
        expect(typeof name).toEqual('string')
        expect(name).toEqual('test')
      })
    })

    describe('update', () => {
      it('should update', async () => {
        const count = await db.update(`update users set name = 'test2' where name = 'test'`)
        expect(count).toBe(1)
      })
      it('should update with parameters', async () => {
        const query = `update users set name = ${t(1)} where name = ${t(2)}`
        const res = await db.update(query, ['test', 'test2'])
        expect(res).toBe(1)
      })
    })

    describe('statement', () => {
      it('should execute statement',  async () => {
        const res = await db.statement('alter table users add column cell_phone varchar(255)')
        expect(res).toBe(undefined)
        const users = await db.select('select * from users')
        const user = users[0]
        // expect(user).toHaveProperty('cell_phone')
      })
      it('should execute statement with params', async () => {
        const res = await db.statement(`update users set name=${t(1)} where name = ${t(2)}`, ['test2', 'test'])
        expect(res).toBe(undefined)
        const users = await db.select("select * from users")
        const user = users[0]
        expect(user).toHaveProperty('name', 'test2')
      })
    })

    describe('delete', () => {
      it('should delete', async () => {
        const count = await db.delete(`delete from users where name = ${p()}`, ['test2'])
        expect(count).toBe(1)
      })
    })

    describe('transaction', () => {
      it('should run transaction', async () => {
        const email = Math.random().toString(36).substring(7) + '@gmail.com'
        const password = Math.random().toString(36).substring(7)

        await db.transaction(async (db) => {
          const params = ['test',email, password]
          await db.insert(`insert into users (name, email, password) values (${p(3)})`, params)
        })
        const users = await db.select(`select * from users where email=${p()}`,[email])
        expect(users).toHaveLength(1)
        const user = users[0]
        expect(user).toHaveProperty('email', email)
      })

      it('should automatically rollback transaction on error', async () => {
        const email = Math.random().toString(36).substring(7) + '@gmail.com'
        const password = Math.random().toString(36).substring(7)
        try {
          await db.transaction(async (db) => {
            const params = ['test',email, password]
            await db.insert(`insert into users (name, email, password) values (${p(3)})`, params)
            await db.insert('insert into users (name, email, password) values ()', params)
            expect(true).toBe(false)
          })
        } catch (e) {}

        const users = await db.query(`select * from users where email=${p()}`,[email])
        expect(users).toHaveLength(0)
      })

      it('should rollback transaction', async () => {
        await db.beginTransaction()
        const email = Math.random().toString(36).substring(7) + '@gmail.com'
        const password = Math.random().toString(36).substring(7)
        await db.insert(`insert into users (name, email, password) values (${p(3)})`, ['test',email, password])
        await db.rollback()
        const users = await db.query(`select * from users where email=${p()}`,[email])
        expect(users).toHaveLength(0)
      })
      it('should commit transaction', async () => {
        await db.beginTransaction()
        const email = Math.random().toString(36).substring(7) + '@gmail.com'
        const password = Math.random().toString(36).substring(7)
        await db.insert(`insert into users (name, email, password) values (${p(3)})`, ['test',email, password])
        await db.commit()
        const users = await db.query(`select * from users where email=${p()}`,[email])
        expect(users).toHaveLength(1)
      })
    })

    const t = (num:number) => {
      switch(connection) {
        case 'mysql':
        case 'mariadb':
          return '?'
        default:
          return `$${num}`
      }
    }
    const p = (count = 1) => {
      switch (connection) {
        case 'mysql':
        case "mariadb":
          return Array(count).fill('?').join(', ')
        default:
          return Array(count).fill('$').map((x,i) =>`$${i+1}`).join(', ')
      }
    }
  })
}
