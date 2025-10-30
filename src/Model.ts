import ModelCore from '../lib/model/ModelCore.js';
import {toCamelCase} from '../lib/util.js';

export default class Model extends ModelCore {

  fill(attributes:Record<string, any>):Model {
    let isStrict = this.$.hasStrictAttributes()
    if (!this.$fillable.length && isStrict) {
      throw new Error(`Model ${this.constructor.name} has no fillable attributes`)
    }

    for (let name in attributes) {
      const value = attributes[name]
      name = toCamelCase(name)

      if (this.$.reservedProperties.includes(name)) {
        throw new Error(`Model ${this.constructor.name} ${name} is immutable`)
      }
      if (this.$guarded.includes(name)) {
        if (isStrict) {
          throw new Error(`Model ${this.constructor.name} cannot fill guarded attribute ${name}`)
        } else {
          continue
        }
      }

      if (this.$fillable.length && this.$fillable.includes(name) && this.$.attributes.has(name)) {
        this.$.changedAttributes.set(name, value)
        continue
      } else if (isStrict && !this.$fillable.includes(name)) {
        throw new Error(`Model ${this.constructor.name} "${name}" is not a fillable attributes`)
      }

      if (this.$.properties.has(name) || this.$.attributes.has(name) || this.$.modelMethods.has(name)) {
        this.$.changedAttributes.set(name, value)
      } else if (isStrict) {
        throw new Error(`${this.constructor.name} Model: unknown attribute "${name}"`)
      }
    }
    return this
  }

  save() {
    const values:Record<string,any> = {...Object.fromEntries(this.$.changedAttributes)}
    const {query, params} = this.$.qb.insert(values).toStatement()
    this.$.qb.reset()
    this.$.qb.table(this.tableName())
    if (this.attributes().hasOwnProperty(this.$primaryKey)) {
      return this.$.db.update(query, params)
    } else {
      return this.$.db.insert(query, params)
    }
  }

  get<T>():Promise<(T & this)[]> {
    this.$.qb.reset()
    return this.$.qb.table(this.tableName())
      .get()
      .then((rows:this & T[]) => {
        return rows.map((row:T & this) => {
          let model:this = new (this as any).constructor()
          model.getAllPropertyNames()
          model.$.db = this.$.db
          model.$.config = this.$.config
          model.$.qb = this.$.qb
          model.$.initialized = true
          model.fill(row)
          return model as T & this
        })
      })
  }

  first<T>() {
    const record:any = this.$.db.table(this.tableName())
      .select('*')
      .limit(1)
      .first()

    if (!record) return this

    return this
  }

  async find(identifier):Promise<this> {
    const record:any = await this.$.db.table(this.tableName())
      .select('*')
      .where(this.$primaryKey, '=', identifier)
      .limit(1)
      .first()

    if (!record) return this
    this.fill(record)
    return this
  }

  attributes() {
    let attributes = {...this.$.attributes, ...Object.fromEntries(this.$.changedAttributes)}
    for (let name in attributes) {
      if (this.$hidden.includes(name)) {
        delete attributes[name]
      }
    }
    return attributes
  }
}
