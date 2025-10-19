import {SchemaTestSuite} from './SchemaTestSuite.js';
import Schema from '../../src/Schema.js';
import Elegant from '../../src/Elegant.js';


describe(`Schema`, () => {
  let schema:Schema;
  let db:Elegant;

  describe('MySQL Schema', () => {
    beforeAll(async () => {
      db = await Elegant.connection('mysql')
    })
    beforeEach(async () => {
      const options = { connection:'mysql', autoExecute: true };
      schema = new Schema(db, options);
    })
    afterAll(async () => {
      await db.disconnect()
    })
    it('should get Schema instance', () => {
      expect(schema).toBeInstanceOf(Schema)
    })
    it('should get connection', () => {
      expect((schema as any).$.db).toBeInstanceOf(Elegant)
    })

    describe('fn', () =>  {
      /**
       * @todo automatically render the declare block like in postgres
       */
      it('should create function', async () => {
        return schema.fn('get_user_id', (fn) => {
          fn.params.string('email')
          fn.returns.int('user_id_out')
          fn.body(`
            DECLARE email_address VARCHAR(255);
            SELECT email into email_address FROM users WHERE id = user_id;
            RETURN email_address;
          `)
        })
      })
      it('should drop functions', async () => {
        return schema.dropFn('get_user_id')
      })
    })
  })

  describe('Postgres Schema', () => {
    beforeAll(async () => {
      db = await Elegant.connection('postgres')
    })
    beforeEach(async () => {
      const options = { connection:'postgres', autoExecute: true };
      schema = new Schema(db, options);
    })
    afterAll(async () => {
      await db.disconnect()
    })
    it('should get Schema instance', () => {
      expect(schema).toBeInstanceOf(Schema)
    })
    it('should get connection', () => {
      expect((schema as any).$.db).toBeInstanceOf(Elegant)
    })

    describe('fn', () =>  {
      it('should create function', async () => {
        return schema.fn('get_user_id', (fn) => {
          fn.params.string('email_in')
          fn.returns.int('user_id_out')
          fn.body(`
            SELECT user_id into user_id_out FROM users WHERE email = email_in;
            RETURN email_address;
          `)
        })
      })
      it('should drop functions', async () => {
        return schema.dropFn('get_user_id', (fn) => {
          fn.params.string('email_in')
        })
      })
    })
  })
})
