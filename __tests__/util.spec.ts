import {inferTableNameFromColumn, inferTableNameFromModelName, toSnakeCase} from '../lib/util.js';

describe('util', () => {
  it('inferTableNameFromColumn', () => {
    expect(inferTableNameFromColumn('product_id')).toEqual('products')
    expect(inferTableNameFromColumn('directory_id')).toEqual('directories')
  })
  it('inferTableNameFromModelName', () => {
    expect(inferTableNameFromModelName('PremiumProduct')).toEqual('premium_products')
    expect(inferTableNameFromModelName('ProductCategory')).toEqual('product_categories')
  })

  it('toSnakeCase', () => {
    expect(toSnakeCase('PremiumProduct')).toEqual('premium_product')
    expect(toSnakeCase('ProductCategory')).toEqual('product_category')
  })


})
