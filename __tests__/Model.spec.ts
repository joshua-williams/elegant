import Elegant, {Model, QueryBuilder, Schema} from '../index.js';
import { vi } from 'vitest';

describe('Model', () => {
  let schema:Schema;
  beforeAll(async () => {
    const db = await Elegant.singleton()
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
    Elegant.disconnect()
  })

  describe('create', () => {
    it('should create model instance', async () => {
      class UserModel extends Model {}
      const user = await UserModel.create()
      expect(user).toBeInstanceOf(UserModel)
    })
    it('should create model instance with attributes', async () => {
      class UserModel extends Model {
        $fillable = ['firstName', 'lastName', 'email']
        firstName:string
        lastName:string
        email:string
      }
      const user:any = await UserModel.create({firstName:'John', lastName:'Doe'})
      expect(user).toBeInstanceOf(UserModel)
      console.log(user.firstName)
      expect(user.firstName).toEqual('John')
      // expect(user.lastName).toEqual('Doe')
    })
  })
  describe('fill strictAttributes', () => {
    it('should throw error when attempting to fill attributes if fillable is not set', async () => {
      class UserModel extends Model {}
      const user:any =  await UserModel.create()
      const expected = () => user.fill({firstName:'John', lastName:'Doe'})
      expect(expected).toThrow('Model UserModel has no fillable attributes')
    })

    it('should throw error when attempting to fill property not in attributes', async () => {
      class UserModel extends Model {
        $fillable = ['firstName', 'lastName', 'email']
      }
      const user:any = await (new UserModel()).init()
      const expected = () => user.fill({firstName:'John', lastName:'Doe'})
      expect(expected).toThrow('Model UserModel "firstName" is not a known attribute')
    })

    it('should throw error when attempting to fill a guarded property', async () => {
      class UserModel extends Model {
        $attributes = ['firstName', 'lastName', 'email']
        $fillable = ['firstName', 'lastName', 'email']
        $guarded = ['email']
      }
      const user:any = await (new UserModel()).init()
      const expected = () => user.fill({firstName:'John', lastName:'Doe'})
      user.fill({email:'no@email.com'})

      expect(expected).toThrow('Model UserModel "firstName" is not a known attribute')
    })
  })

  describe('proxy', () => {

    afterEach(async () => {
      Elegant.disconnect()
    })

    it('mutator', async () => {
      class User extends Model {
        firstName({mutator}) {
          mutator((firstName) => firstName === 'William' ? 'Bill' : firstName)
        }
      }
      const user = await new User().init() as any
      user.firstName = 'William'
      expect(user.firstName).toEqual('Bill')
    })

    it('accessor', async () => {
      class User extends Model {
        firstName({accessor}) {
          accessor((firstName) => 'Bill')
        }
      }
      const user = await new User().init() as any
      expect(user.firstName).toEqual('Bill')
    })

    it('modifier', async () => {
      class User extends Model {
        firstName({ modifier }) {
          modifier((firstName:string) => firstName === 'William' ? 'Bill' : firstName)
        }
      }
      const user = await new User().init() as any
      user.firstName = 'William'
      expect(user.firstName).toEqual('Bill')
    })
    it('accessor and mutator', async () => {
      class User extends Model {
        firstName({ accessor, mutator}) {
          accessor((firstName) => firstName ? firstName : 'Guest')
          mutator(firstName => firstName.toUpperCase())
        }
      }
      const user = await new User().init() as any
      expect(user.firstName).toEqual('Guest')
      user.firstName = 'william'
      expect(user.firstName).toEqual('WILLIAM')
    })
  })
})
