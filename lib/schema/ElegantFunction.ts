import ElegantTableCore from './ElegantTableCore.js';
import ElegantFunctionReturn from './ElegantFunctionReturn.js';
import {ElegantFunctionMeta} from '../../types.js';

export default class ElegantFunction  {

  private $:ElegantFunctionMeta = {
    action: 'create',
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

  body(body:string) {
    this.$.body = body
  }

  getBody() {
    return this.$.body
  }

  drop() {
    this.$.action = 'drop'
    return this
  }
  get returns() {
    return this.$.returns
  }
  get params() {
    return this.$.params
  }
  get action() {
    return this.$.action
  }
}
