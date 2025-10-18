import {inferTableName} from '../lib/util.js';

describe('util', () => {
  it('inferTableName', () => {
    expect(inferTableName('product_id')).toEqual('products')
    expect(inferTableName('directory_id')).toEqual('directories')
  })



})
