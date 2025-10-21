import Elegant from './Elegant.js';
import QueryBuilder from './QueryBuilder.js';
import {getAppConfig} from '../lib/config.js';
import {ElegantConfig} from '../types.js';

type ModelMeta = {
  db:Elegant,
  queryBuilder:QueryBuilder,
  config:ElegantConfig
}
export default class Model {
  private initialized = false;
  protected connection:string
  protected table:string
  protected primaryKey:string
  protected timestamps:boolean = true
  protected created_at = 'created_at'
  protected updated_at = 'updated_at'
  protected fillable:string[] = undefined
  protected guarded:string[] = undefined
  protected attributes:Record<string, any> = {}
  private $:ModelMeta = {
    db: undefined,
    queryBuilder: new QueryBuilder(),
    config: undefined
  }

  constructor(db?:Elegant){
    if (db) {
      this.$.db = db;
    }
  }

  fill(attributes:Record<string, any>):Model {

    if ( !this.fillable || !this.fillable.length) {
      if (this.$.config.models.strictAttributes) {
        throw new Error(`Model ${this.constructor.name} has no fillable attributes`)
      }
    }
    for (let key in attributes) {
      if (this.fillable.includes(key)) {
        if (this.guarded && this.guarded.includes(key)) {
          if (this.$.config.models.strictAttributes) {
            throw new Error(`Model ${this.constructor.name} cannot fill guarded attribute ${key}`)
          } else {
            continue
          }
        }
        this.attributes[key] = attributes[key]
      }
    }
    return this
  }

  save() {

  }
  all<T>() {
    const {query} = this.$.queryBuilder.select('*').toStatement()
    return this.$.db.select<T>(query)
  }

  async init():Promise<Model> {
    if (this.initialized) return this
    await getAppConfig()
    await this.getConnection()
    for (const key of this.fillable) {
      Object.defineProperty(this, key, {
        enumerable: true,
        get() {
          return this.attributes[key]
        },
        set(v: any) {
          this.attributes[key] = v
        }
      })
    }
    this.initialized = true
    return this
  }

  private async getConnection() {
    if (this.initialized) return this.$.db
    const {default: connection} = await getAppConfig()
    this.$.db = await Elegant.singleton(this.connection || connection)
    return this.$.db
  }

  private getMethods() {
    const proto = Object.getPrototypeOf(this); // Get the prototype of the current instance
    const propertyNames = Object.getOwnPropertyNames(proto); // Get all own property names of the prototype

    // Filter to include only functions (methods) and exclude the constructor
    const methods = propertyNames.filter(name => {
      return typeof this[name] === 'function' && name !== 'constructor';
    });

    return methods;
  }

  disconnect() {
    if (!this.initialized) return
    return this.$.db.disconnect()
  }
}
