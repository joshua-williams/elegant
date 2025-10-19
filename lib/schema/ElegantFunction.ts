import ElegantTableCore from './ElegantTableCore.js';
import ElegantFunctionReturn from './ElegantFunctionReturn.js';

export default class ElegantFunction  {

  private $ = {
    name: '',
    params: new ElegantTableCore(),
    returns: new ElegantFunctionReturn(),
    body: ''
  }

  constructor(name: string) {
    this.$.name = name
  }

  get name() {
    return this.$.name
  }

  get body() {
    return this.$.body
  }

  set body(value:string) {
    this.$.body = value;
  }

  get returns() {
    return this.$.returns
  }
  get params() {
    return this.$.params
  }
}
