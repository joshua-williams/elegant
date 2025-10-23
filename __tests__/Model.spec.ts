import Elegant, {Model, QueryBuilder, Schema} from '../index.js';
import { vi } from 'vitest';

describe('Model', () => {
  let schema:Schema;
  beforeAll(async () => {
    const db = await Elegant.connection()
    schema = new Schema(db)
    await schema.drop('users', table => table.ifExists())
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

  describe.skip('create', () => {
    it('should create model instance', async () => {
      class UserModel extends Model {}
      const user = await UserModel.create()
      expect(user).toBeInstanceOf(UserModel)
    })
    it('should create model instance with attributes', async () => {
      class UserModel extends Model {
        fillable = ['firstName', 'lastName', 'email']
      }
      const user:any = await UserModel.create({firstName:'John', lastName:'Doe'})
      expect(user).toBeInstanceOf(UserModel)
      expect(user.firstName).toEqual('John')
      expect(user.lastName).toEqual('Doe')
    })
  })
  describe.skip('fill strictAttributes', () => {
    it('should throw error when attempting to fill attributes if fillable is not set', async () => {
      class UserModel extends Model {}
      const user:any =  await UserModel.create()
      const expected = () => user.fill({firstName:'John', lastName:'Doe'})
      expect(expected).toThrow('Model UserModel has no fillable attributes')
    })

    it('should throw error when attempting to fill property not in attributes', async () => {
      class UserModel extends Model {
        fillable = ['firstName', 'lastName', 'email']
      }
      const user:any = await (new UserModel()).init()
      const expected = () => user.fill({firstName:'John', lastName:'Doe'})
      expect(expected).toThrow('Model UserModel "firstName" is not a known attribute')
    })

    it('should throw error when attempting to fill a guarded property', async () => {
      class UserModel extends Model {
        attributes = ['firstName', 'lastName', 'email']
        fillable = ['firstName', 'lastName', 'email']
        guarded = ['email']
      }
      const user:any = await (new UserModel()).init()
      const expected = () => user.fill({firstName:'John', lastName:'Doe'})
      user.fill({email:'no@email.com'})

      expect(expected).toThrow('Model UserModel "firstName" is not a known attribute')
    })
  })

  describe('proxy', () => {
    it('should proxy model', async () => {

      class User extends Model {
        firstName:string = 'John'
        lastName:string = 'Doe'
        email:string
        phone:string
        address:string
        city:string
        state:string
        zip:string

        firstNameFilter() {
          console.log('first name filter')
        }
        lastNameFilter() {}
      }

      // const user = await User.create<User>()
      const user = await new User().init()
      user.firstName = 'John'
      user.lastName = 'Doe'
      await Elegant.disconnect()
    })

  })
})
