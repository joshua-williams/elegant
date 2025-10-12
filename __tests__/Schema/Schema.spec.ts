import {SchemaTestSuite} from './SchemaTestSuite.js';

describe('Schema', () => {
  SchemaTestSuite('postgres')
  SchemaTestSuite('mysql')
  SchemaTestSuite('mariadb')
  SchemaTestSuite('sqlite')
});
