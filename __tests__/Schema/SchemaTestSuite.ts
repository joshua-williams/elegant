import Schema from '../../src/schema/Schema';
import {beforeEach} from 'vitest';
import Elegant from '../../src/Elegant';

export const SchemaTestSuite = (connection:string) => {
  describe(`Schema: ${connection}`, () => {
    let schema:Schema;
    let db:Elegant;

    beforeEach(async () => {
      db = await Elegant.connection(connection)
      schema = new Schema(db)
    })

    it('should get Schema instance', () => {
      expect(schema).toBeInstanceOf(Schema)
    })
    it('should get connection', () => {
      expect((schema as any).$.db).toBeInstanceOf(Elegant)
    })

  })
};
