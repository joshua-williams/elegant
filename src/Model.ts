import ModelCore from '../lib/model/ModelCore.js';

export default class Model extends ModelCore {

  fill(attributes:Record<string, any>):Model {
    const isStrict = this.$.config.models.strictAttributes
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
          throw new Error(`"${this.constructor.name} Model: unknown attribute ${name}"`)
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


}
