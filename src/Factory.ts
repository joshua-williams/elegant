import {Model} from '../index.js'

export const makeModel = async (ModelClass:typeof Model):Promise<Model> => {
  const model = new ModelClass()
  return await model.init();
}

export default {
  makeModel,
}
