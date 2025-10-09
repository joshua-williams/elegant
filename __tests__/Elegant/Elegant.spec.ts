import Elegant from '../../src/Elegant'
import Schema from '../../src/schema/Schema';
import {getAppConfig} from '../../lib/config';
import ElegantTable from '../../lib/schema/ElegantTable';
import {SchemaDialect} from '../../types';


const runTestsWithConnection = (connection:SchemaDialect) => {
  let db: Elegant;
  let schema:Schema;

  describe(`connection: ${connection}`, () => {

    beforeAll(async () => {
      const config = await getAppConfig()
      db = await Elegant.connection(connection)
      schema = new Schema(config)
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
      await schema.create('users', createUserTable, connection)
    })

    afterAll(async () => {
      await schema.drop('users', (table) => {
        table.ifExists()
      })
      await db.close()
    })

    beforeEach(async () => {
      db = await Elegant.connection(connection)
    })

    afterEach(async () => {
      await db.close()
    })

    it('should get Elegant instance', async () => {
      expect(db).toBeInstanceOf(Elegant);
    })

    it('should insert', async () => {
      db = await Elegant.connection(connection)
      const email = Math.random().toString(36).substring(7) + '@gmail.com'
      const password = Math.random().toString(36).substring(7)

      return db.insert('insert into users (name, email, password) values ($1, $2, $3)', ['test',email, password])
        .then(res => {
          expect(typeof res).toBe('number')
        })
    })
    it.skip('should select', async () => {
      db = await Elegant.connection('mysl')
      return db.select('select * from migrations')
        .then(res => {
          expect(res).toBeInstanceOf(Array)
        })
    })
  })
}

runTestsWithConnection('postgres')

//
// describe('connection', () => {
//   let db: Elegant;
//   beforeEach(async () => {
//     db = await Elegant.connection();
//   })
//   afterEach(async () => {
//     await db.close()
//   })
//
//
//
//
//
//   it('should scalar', async () => {
//     db = await Elegant.connection('forecastcrm')
//     return db.scalar('select count(*) from migrations')
//       .then(res => {
//         expect(typeof res).toBe('number')
//       })
//   })
//
//   it('should update', async () => {
//     db = await Elegant.connection('forecastcrm')
//     return db.update('update migrations set migration = ? where migration = ?', ['contact','contacts'])
//       .then(res => {
//         expect(typeof res).toBe('number')
//       })
//   })
//   it('should delete', async () => {
//     db = await Elegant.connection('forecastcrm')
//     return db.delete('delete from migrations where migration = ?', ['contact'])
//       .then(res => {
//         expect(typeof res).toBe('number')
//       })
//   })
//   it('should statement', async () => {
//     db = await Elegant.connection('forecastcrm')
//     let params = [
//       ['test',5],
//       ['test2',6],
//       ['test3',7],
//     ]
//     return db.statement('insert into migrations (migration, batch) values (?,?)', params)
//       .then(response => {
//         expect(response).toBeInstanceOf(Array)
//         expect(response.length).toBe(3)
//       })
//   })
//
//   it('should get query builder', async () => {
//     const qb = db.table('migrations')
//     expect(qb).toBeInstanceOf(QueryBuilder)
//   })
// });
