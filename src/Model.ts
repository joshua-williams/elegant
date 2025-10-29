import ModelCore from '../lib/model/ModelCore.js';

export default class Model extends ModelCore {

  fill(attributes:Record<string, any>):Model {
    let isStrict = this.$.hasStrictAttributes()
    if (!this.$fillable.length && isStrict) {
      throw new Error(`Model ${this.constructor.name} has no fillable attributes`)
    }

    for (let name in attributes) {
      if (this.$.reservedProperties.includes(name)) {
        throw new Error(`Model ${this.constructor.name} ${name} is immutable`)
      }
      if (!this.$fillable.includes(name)) {
        if (isStrict) {
          throw new Error(`Model ${this.constructor.name} "${name}" is not a fillable attributes`)
        } else {
          continue
        }
      }
      if (!this.$.attributes.has(name)) {
        if (isStrict) {
          throw new Error(`${this.constructor.name} Model: unknown attribute "${name}"`)
        } else {
          continue
        }
      }
      if (this.$guarded.includes(name)) {
        if (isStrict) {
          throw new Error(`Model ${this.constructor.name} cannot fill guarded attribute ${name}`)        } else {
          continue
        }
      }
      this.$.changedAttributes.set(name, attributes[name])
    }
    return this
  }

  save() {
    const {query, params} = this.$.queryBuilder.insert(this.attributes()).toStatement()
    this.$.queryBuilder.reset()
    this.$.queryBuilder.table(this.tableName())
    if (this.attributes().hasOwnProperty('id')) {
      return this.$.db.update(query, params)
    } else {
      return this.$.db.insert(query, params)
    }
  }

  first<T>() {
    const columns = Array.from(this.$.attributes).join(', ')
    return this.$.db.select(`select ${columns} from ${this.tableName()} limit 1`)
      .then((row:T[]) => row[0])
  }

  all<T>() {
    const columns = Array.from(this.$.attributes).join(', ')
    return this.$.db.select(`select ${columns} from ${this.tableName()}`)
      .then((rows:T[]) => rows)
  }

  attributes() {
    const attributes = {}
    for (const [key, val] of this.$.attributes) {
      if (this.$hidden.includes(key)) continue
      attributes[key] = val === undefined ? this.$.changedAttributes.get(key) : val
    }
    return attributes
  }
}
