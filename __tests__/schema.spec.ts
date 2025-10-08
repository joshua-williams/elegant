import Schema from '../src/schema/Schema';
import {getAppConfig} from '../lib/config';

let schema:Schema;

describe('schema', () => {
  beforeEach(async () => {
    const config = await getAppConfig()
    schema = new Schema(config)
  })
  it.skip('should create table on specific connection', () => {
    schema.connection('postgres')
      .create('users', (table) => {
        table.temporary()
          .engine('InnoDB')
          .charset('utf8mb3')
          .collation('utf16_general_ci')
          .comment('users table')
        table.integer('id', 255).autoIncrement().unique().primary()
        table.string('name').unique()
        console.log(table.toCreateStatement())
      })
  })

  describe('inspect database', ()=> {
    it('should get tables', async () => {
      const tables = await schema.getTables()
      console.log(tables)
    })
  })

  describe('drop table', () => {
    it('should drop table', () => {
      schema.drop('users', table => {
        table.ifExists()
        expect(table.toCreateStatement()).toEqual('DROP TABLE IF EXISTS `users`')
      })
    })
  })
});
