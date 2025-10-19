import Elegant, {Model, QueryBuilder, Schema} from '../index.js';

describe('Model', () => {
  let schema:Schema;
  beforeAll(async () => {
    const db = await Elegant.connection()
    schema = new Schema(db)
    await schema.create('users', (table) => {
      table.id()
      table.string('first_name')
      table.string('last_name')
      table.string('email').unique()
    })
  })

  afterAll(async () => {
    await schema.disconnect()
  })
  
  describe('fill', () => {
    it('should not fill by default', async () => {
      class UserModel extends Model {}
      const user:any = new UserModel()
      user.fill({firstName:'John', lastName:'Doe'})
      expect(user.firstName).toBe(undefined)
    })
    it('should fill', async () => {
      class UserModel extends Model {
        fillable = ['firstName', 'lastName', 'email']
      }
      const user:any = await (new UserModel()).init()
      user.fill({firstName:'John', lastName:'Doe'})
      expect(user.firstName).toEqual('John')
      expect(user.lastName).toEqual('Doe')
    })
  })
})
