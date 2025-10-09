import Schema from '../src/schema/Schema';
import {getAppConfig} from '../lib/config';
import {ElegantConfig} from '../types';
import {afterAll} from 'vitest';

let schema:Schema;
let config:ElegantConfig

describe('schema', () => {
  beforeAll(async () => {
    config = await getAppConfig()
    schema = new Schema(config)
    schema.connection('postgres')
      .create('users', (table) => {
        table.temporary()
          .engine('InnoDB')
          .charset('utf8mb3')
          .collation('utf16_general_ci')
          .comment('users table')
        table.integer('id', 255).autoIncrement().unique().primary()
        table.string('name').unique()
        // console.log(table.toCreateStatement())
      })
  })

  afterAll(async () => {
    schema = new Schema(config)
    await schema.connection('postgres').drop('users')
  })

  beforeEach(async () => {
    schema = new Schema(config)
  })

  describe('getTables', ()=> {
    it('should get tables from default connection', async () => {
      const tables = await schema.listTables()
      expect(tables).toBeInstanceOf(Array)
    })
    it('should get tables from named connection', async () => {
      const tables = await schema.connection('postgres').listTables()
      expect(tables).toBeInstanceOf(Array)
    })
  })

  describe.skip('drop table', () => {
    it('should drop table', () => {
      schema.drop('users', table => {
        table.ifExists()
        expect(table.toStatement()).toEqual('DROP TABLE IF EXISTS `users`')
      })
    })
  })
});
