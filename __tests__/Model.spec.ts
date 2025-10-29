import Elegant, {Model, Schema} from '../index.js';
import {randomUUID} from 'node:crypto';

describe('Model', () => {
  let schema:Schema;
  beforeAll(async () => {
    const db = await Elegant.singleton()
    schema = new Schema(db)
    await schema.dropTable('users', table => table.ifExists())
    schema.createTable('users', (table) => {
      table.id()
      table.string('first_name')
      table.string('last_name')
      table.string('email').unique()
      table.ifNotExists()
    })
    await Promise.all(schema.$.executePromises)
  })

  afterAll(async () => {
    await Elegant.disconnect()
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
      expect(user.firstName).toEqual('John')
      expect(user.lastName).toEqual('Doe')
    })
  })

  describe('fill', () => {
    describe('fill strictAttributes', () => {
      beforeAll(() => {
        (process.env as any).ELEGANT_STRICT_ATTRIBUTES = true
      })
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
        const user:any = await new UserModel().init()
        const expected = () => user.fill({firstName:'John', lastName:'Doe'})
        expect(expected).toThrow('UserModel Model: unknown attribute "firstName"')
      })

      it('should throw error when attempting to fill a guarded property', async () => {
        class UserModel extends Model {
          $attributes = ['firstName', 'lastName', 'email']
          $fillable = ['firstName', 'lastName', 'email']
          $guarded = ['email']
        }
        const user:any = await (new UserModel()).init()
        const expected = () => user.fill({firstName:'John', lastName:'Doe'})
        expect(expected).toThrow('UserModel Model: unknown attribute "firstName"')
      })
    })

    describe('fill non-strictAttributes', () => {
      beforeAll(() => {
        (process.env as any).ELEGANT_STRICT_ATTRIBUTES = false
      })
      it('should not throw error when attempting to fill attributes if fillable is not set', async () => {
        class UserModel extends Model {}
        const user:any =  await UserModel.create()
        const expected = () => user.fill({firstName:'John', lastName:'Doe'})
        expect(expected).not.toThrow('Model UserModel has no fillable attributes')
      })

      it('should throw error when attempting to fill property not in attributes', async () => {
        class UserModel extends Model {
          $fillable = ['firstName', 'lastName', 'email']
        }
        const user:any = await new UserModel().init()
        const expected = () => user.fill({firstName:'John', lastName:'Doe'})
        expect(expected).not.toThrow('UserModel Model: unknown attribute "firstName"')
      })

      it('should throw error when attempting to fill a guarded property', async () => {
        class UserModel extends Model {
          $attributes = ['firstName', 'lastName', 'email']
          $fillable = ['firstName', 'lastName', 'email']
          $guarded = ['email']
        }
        const user:any = await (new UserModel()).init()
        const expected = () => user.fill({firstName:'John', lastName:'Doe'})
        expect(expected).not.toThrow('UserModel Model: unknown attribute "firstName"`')
      })
    })
  })

  describe('transformers', () => {

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

  describe('attributes', () => {
    afterAll(async () => {
      await Elegant.disconnect()
    })

    it('should get attributes', async () => {
      class UserModel extends Model {
        firstName:string
        lastName:string
      }
      const user = await new UserModel().init()
      user.firstName = 'John'
      user.lastName = 'Doe'
      const expected = {firstName: 'John', lastName: 'Doe'}
      const expectedKeys = [ 'firstName' , 'lastName' ]
      expect(user.attributes()).toEqual(expected)
      expect(Object.keys(user.attributes())).toEqual(expectedKeys)
    })

    it('should not get hidden attributes', async () => {
      class UserModel extends Model {
        $hidden = ['password']
        firstName:string
        lastName:string
        password:string
      }
      const user = await new UserModel().init()
      user.firstName = 'John'
      user.lastName = 'Doe'
      user.password = 'secret'
      const expected = {firstName: 'John', lastName: 'Doe'}
      expect(user.attributes()).toEqual(expected)
      expect(user.attributes()).to.not.have.property('password')
    })
  })

  describe('insert', () => {
    class UserModel extends Model {
      $hidden = ['password']
      firstName:string
      lastName:string
      password:string
      email({modifier}) {
        modifier(email => randomUUID() +  email)
      }
    }
    let user:UserModel

    beforeEach(async () => {
      user = await new UserModel().init()
    })

    afterAll(async () => {
      await Elegant.disconnect()
    })

    it('insert', async () => {
      const user:any = await new UserModel().init()
      user.firstName = 'Jack'
      user.lastName = 'Black'
      user.email = 'jack.black@example.com'
      user.password = 'secret'
      let id = await user.save()
      expect(id).toBeGreaterThan(0)
    })
  })
})
