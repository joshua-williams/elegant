import Schema from '../../src/Schema.js';
import Elegant from '../../src/Elegant.js';

export const SchemaTestSuite = (connection:string) => {
  describe(`Schema: ${connection}`, () => {
    let schema:Schema;
    let db:Elegant;

    beforeAll(async () => {
      db = await Elegant.connection(connection)
    })
    beforeEach(async () => {
      const options = { connection, autoExecute: true };
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
        return schema.function('get_user_id', (fn) => {
          fn.params.string('email')
          fn.returns.int('user_id')
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
};
