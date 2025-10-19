import Elegant from './Elegant.js';
import QueryBuilder from './QueryBuilder.js';
import {getAppConfig} from '../lib/config.js';

type ModelMeta = {
  db:Elegant,
  queryBuilder:QueryBuilder,
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
  }

  constructor(db?:Elegant){
    if (db) {
      this.$.db = db;
    }
  }


  fill(attributes:Record<string, any>):Model {
    if ( !this.fillable || !this.fillable.length) return this
    for (let key in attributes) {
      if (this.fillable.includes(key)) {
        if (this.guarded && this.guarded.includes(key)) continue
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
    this.$.db = await Elegant.connection(this.connection || connection)
    return this.$.db
  }

  disconnect() {
    if (!this.initialized) return
    return this.$.db.disconnect()
  }
}
