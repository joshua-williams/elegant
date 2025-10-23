import Elegant from '../../src/Elegant.js';
import {Model, QueryBuilder} from '../../index.js';
import {ElegantConfig} from '../../types.js';
import {getAppConfig} from '../config.js';
import ModelRelationships from './ModelRelationships.js';
import {inferTableNameFromModelName} from '../util.js';

type ModelCoreMeta = {
  db:Elegant,
  queryBuilder:QueryBuilder,
  config:ElegantConfig,
  initialized:boolean,
  reservedProperties: string[],
  reservedMethods: Set<string>,
  modelMethods:Set<string>,
  attributes:string[],
  defaultAttributes:Record<string, any>
  changedAttributes:Record<string, any>
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
  protected $:ModelCoreMeta = {
    db: undefined,
    queryBuilder: new QueryBuilder(),
    config: undefined,
    initialized: false,
    reservedProperties: [],
    reservedMethods: new Set(),
    modelMethods: new Set(),
    attributes: [],
    defaultAttributes: {},
    changedAttributes: {},
  }

  constructor(db?:Elegant, config?:ElegantConfig) {
    super()
    if (db) this.$.db = db;
    if (config) this.$.config = config;
    this.$.queryBuilder.table(this.$table||inferTableNameFromModelName(this.constructor.name))
    this.$.reservedProperties =  Object.getOwnPropertyNames(this)

    const proxy = new Proxy(this, {
      get(target, prop, receiver) {
        return target[prop]
      },
      set(target, prop, value) {
        if (typeof prop === 'string') {
          return target.setProperty(prop, value)
        }
      }
    })
    return proxy
  }

  /**
   * Retrieves all property names (own and inherited) from the given object, excluding those on `Object.prototype`.
   *
   * @param {Object} obj The object from which to retrieve the property names.
   * @return {string[]} An array of all property names found on the object and its prototype chain.
   */
  getAllPropertyNames() {
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
        } else {
          this.$.reservedMethods.add(prop)
        }
      });
      current = Object.getPrototypeOf(current);
    }
  }

  public static async create<T extends Model>(attributes?:Record<string, any>) {
    const model = new this()
    await model.init()
    return model as T
  }

  async init():Promise<this> {
    this.getAllPropertyNames()
    if (this.$.initialized) return this
    this.$.config = await getAppConfig()
    this.$.db = await this.getConnection()
    this.$.attributes = Object.getOwnPropertyNames(this)
      .filter(name => !this.$.reservedProperties.includes(name))
    const instanceMethods = Object.getOwnPropertyNames(this.constructor.prototype)
      .filter(prop => prop !== "constructor" && typeof this[prop] === "function");
    this.$.initialized = true
    return this
  }

  protected tableName() {
    return this.$table || inferTableNameFromModelName(this.constructor.name)
  }
  private async getConnection() {
    if (this.$.initialized) return this.$.db
    const {default: connection} = await getAppConfig()
    this.$.db = await Elegant.singleton(this.$connection || connection)
    return this.$.db
  }

  private setProperty(name:string, value:any) {
    if (this.$.reservedProperties.includes(name)) {
      throw new Error(`Model ${this.constructor.name} ${name} is immutable`)
    }
    if (this.$guarded.includes(name)) {
      throw new Error(`Model ${this.constructor.name} cannot fill guarded attribute ${name}`)
    }
    if (!this.$.attributes.includes(name)) {
      if (this.$.config.models.strictAttributes) {
        throw new Error(`${this.constructor.name} Model: unknown attribute ${name}"`)
      }
      return
    }

    this.$.changedAttributes[name] = value
    return this[name] = value
  }

  disconnect() {
    if (!this.$.initialized) return
    return this.$.db.disconnect()
  }
}
