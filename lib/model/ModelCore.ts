import Elegant from '../../src/Elegant.js';
import {Model, QueryBuilder} from '../../index.js';
import {AttrXformers, ElegantConfig, Scalar} from '../../types.js';
import {getAppConfig} from '../config.js';
import ModelRelationships from './ModelRelationships.js';
import {inferTableNameFromModelName} from '../util.js';

class ModelCoreMeta {
  db:Elegant
  queryBuilder:QueryBuilder = new QueryBuilder()
  config:ElegantConfig
  initialized:boolean = false
  reservedProperties: string[] = []
  reservedMethods: Set<string> = new Set()
  modelMethods:Set<string> = new Set()
  modelProperties:Set<string> = new Set()
  attributes:Map<string, Scalar> = new Map()
  defaultAttributes:Record<string, any> = {}
  changedAttributes:Map<string, any> = new Map()
  propsLoaded:boolean = false

  constructor(public model:any) {}

  /**
   * Retrieves the value of a property from the Elegant model, applying any defined modifiers, accessors, or mutators.
   * This method also handles specific conditions for property access, such as checking for changes, attributes, and strict attribute configurations.
   *
   * @param {Object} target - The target object from which the property will be retrieved.
   * @param {string} prop - The name of the property to get.
   * @param {Object} receiver - The object that initially called the `get` operation, typically the proxy itself.
   * @return {*} The value of the requested property, which may be transformed by modifiers, accessors, or mutators, or the original property value if no transformations apply.
   */
  getProperty(target, prop, receiver) {
    if (target.$.modelMethods.has(prop) && target.$.propsLoaded) {
      let value;
      if (target.$.changedAttributes.has(prop)) {
        value = target.$.changedAttributes.get(prop)
      }
      let modifierValue = value
      let accessorValue = value
      let mutatorValue = value

      function modifier(value, fn) {
        modifierValue = fn(value)
      }
      function accessor(value, fn) {
        accessorValue = fn(value)
      }
      function mutator(value, fn) {}
      const mutatorFunctions:AttrXformers = {
        accessor: accessor.bind(target, accessorValue),
        mutator: mutator.bind(target, mutatorValue),
        modifier: modifier.bind(target, modifierValue)
      }
      let func = target.model[prop]
      if (typeof func === 'function') {
        func(mutatorFunctions)
      }

      if (modifierValue !== value) {
        return modifierValue
      }
      if (accessorValue !== value) {
        return accessorValue
      }
      return value
    }
    else if (target.$.changedAttributes.has(prop)) {
      return target.$.changedAttributes.get(prop)
    }
    else if (target.$.attributes.has(prop)) {
      return target.$.attributes.get(prop)
    }
    return target[prop]
  }

  /**
   * Sets a property on the specified target with a given name and value.
   * Validates the property against reserved and guarded lists, handles model methods, and processes attribute mutations.
   * Throws an error if the property is immutable, guarded, or does not exist in strict mode.
   *
   * @param {Object} target - The target object where the property should be set.
   * @param {string} name - The name of the property to be set.
   * @param {any} value - The value to be assigned to the property.
   * @return {any|undefined} - Returns the processed value if the property is successfully set; otherwise undefined.
   */
  setProperty(target, name:string, value:any) {
    if (this.reservedProperties.includes(name)) {
      throw new Error(`Model ${this.constructor.name} ${name} is immutable`)
    }
    if (this.model.$guarded.includes(name)) {
      throw new Error(`Model ${this.constructor.name} cannot fill guarded attribute ${name}`)
    }
    if (target.$.modelMethods.has(name) && target.$.propsLoaded) {
      let modifierValue = value
      let mutatorValue = value
      let accessorValue = value

      function modifier(value, fn:(value) => any) {
        modifierValue = fn(value)
      }
      function accessor(value) {
        accessorValue = value
      }
      function mutator(value, fn) {
        mutatorValue = fn(value)
      }
      let func = this.model[name]

      const mutatorFunctions:AttrXformers = {
        accessor: accessor.bind(this, accessorValue),
        mutator: mutator.bind(this, mutatorValue),
        modifier: modifier.bind(this, modifierValue)
      }
      func(mutatorFunctions)
      if (modifierValue !== value) {
        return target.$.changedAttributes.set(name, modifierValue)
      }
      if (mutatorValue !== value) {
        return target.$.changedAttributes.set(name, mutatorValue)
      }
    }
    if (!target.$.attributes.has(name)) {
      if (this.hasStrictAttributes()) {
        throw new Error(`${this.constructor.name} Model: unknown attribute ${name}"`)
      }
      return
    }
    target.$.changedAttributes.set(name, value)
    return this[name] = value
  }

  hasStrictAttributes():boolean {
    let isStrict:boolean = false
    if (process.env.hasOwnProperty('ELEGANT_STRICT_ATTRIBUTES')) {
      isStrict = process.env.ELEGANT_STRICT_ATTRIBUTES === 'true'
    } else if (this.config.models.hasOwnProperty('strictAttributes')) {
      isStrict = this.config.models.strictAttributes
    }
    return isStrict
  }

}

export default class ModelCore extends ModelRelationships{
  protected $connection:string
  protected $table:string
  protected $primaryKey:string
  protected $timestamps:boolean = true
  protected $created_at = 'created_at'
  protected $updated_at = 'updated_at'
  protected $fillable:string[] = []
  protected $guarded:string[] = []
  protected $hidden:string[] = []
  protected $:ModelCoreMeta = new ModelCoreMeta(this)

  /**
   * Constructs an instance of the class and sets up the proxy for property handling.
   *
   * @param {Elegant} [db] - An optional Elegant database instance to associate with the model.
   * @param {ElegantConfig} [config] - An optional configuration object to customize behavior.
   * @return {Proxy} - A proxy instance of the current object for managed property access and mutation.
   */
  constructor(db?:Elegant, config?:ElegantConfig) {
    super()
    if (db) this.$.db = db;
    if (config) this.$.config = config;
    this.$.queryBuilder.table(this.$table||inferTableNameFromModelName(this.constructor.name))
    this.$.reservedProperties =  Object.getOwnPropertyNames(this)
    const proxy = new Proxy(this, {
      get(target, prop, receiver) {
        return target.$.getProperty(target, prop, receiver)
      },
      set(target, prop, value) {
        if (typeof prop === 'string') {
          return target.$.setProperty(target, prop, value)
        }
      }
    })
    return proxy
  }

  toInsertStatement():{query:string, params:Record<string, any>} {
    return this.$.queryBuilder.toStatement()
  }

  /**
   * Retrieves all property names (own and inherited) from the given object, excluding those on `Object.prototype`.
   *
   * @param {Object} obj The object from which to retrieve the property names.
   * @return {string[]} An array of all property names found on the object and its prototype chain.
   */
  getAllPropertyNames() {
    Object.keys(this)
      .filter(prop => !prop.startsWith('$'))
      .forEach(prop => {
        this.$.modelProperties.add(prop)
        this.$.attributes.set(prop, this[prop])
      })
    let current = Object.getPrototypeOf(this);
    while (current && current !== Object.prototype) {
      let properties = Object.getOwnPropertyNames(current)
      let constructorName = current.constructor.name
      if (constructorName === 'ModelCore') {
        current = Object.getPrototypeOf(current)
        continue;
      }
      properties.forEach((prop, index) => {
        if (prop === 'constructor') return
        const isFirstProtocol = this.constructor.name === current.constructor.name
        if (isFirstProtocol) {
          this.$.modelMethods.add(prop)
          if (typeof this[prop] === 'function') {
            this.$.attributes.set(prop, undefined)
          } else {
            this.$.attributes.set(prop, this[prop])
          }
        } else {
          this.$.reservedMethods.add(prop)
        }
      });
      current = Object.getPrototypeOf(current);
    }
    this.$.propsLoaded = true
  }

  /**
   * Creates a new instance of the model, initializes it, and optionally fills it with the provided attributes.
   *
   * @param {Record<string, any>} [attributes] - Optional object containing the attributes to initialize the model instance with.
   * @return {Promise<T>} A promise that resolves to the newly created and initialized model instance.
   */
  public static async create<T extends Model>(attributes?:Record<string, any>) {
    const model = new this()
    await model.init()
    if (attributes) {
      ((model as Model).fill(attributes))
    }
    return model as T
  }

  /**
   * Initializes the instance by setting up application configuration and database connection.
   * Ensures that initialization is only performed once.
   *
   * @return {Promise<this>} A promise that resolves to the initialized instance.
   */
  async init():Promise<this> {
    this.getAllPropertyNames()
    if (this.$.initialized) return this
    this.$.config = await getAppConfig()
    this.$.db = await this.getConnection()
    this.$.initialized = true
    return this
  }

  /**
   * Retrieves the name of the database table associated with the model.
   *
   * The method first checks if the `$table` property is available on the instance.
   * If `$table` is not defined, it infers the table name from the model's constructor name based on Elegant
   * naming conventions.
   *
   * @return {string} The name of the table used by the model.
   */
  protected tableName() {
    return this.$table || inferTableNameFromModelName(this.constructor.name)
  }

  /**
   * Establishes and retrieves the database connection. If already initialized,
   * it returns the existing connection. Otherwise, it initializes the connection
   * and stores it for future use.
   *
   * @return {Promise<Object>} A promise that resolves to the database connection object.
   */
  private async getConnection() {
    if (this.$.initialized) return this.$.db
    const {default: connection} = await getAppConfig()
    this.$.db = await Elegant.singleton(this.$connection || connection)
    return this.$.db
  }
  /**
   * Disconnects from the database if the connection has been initialized.
   *
   * @return {Promise<void>|undefined} Returns a promise that resolves when the disconnection is complete, or undefined if the connection was not initialized.
   */
  disconnect() {
    if (!this.$.initialized) return
    return this.$.db.disconnect()
  }
}
