import {SchemaTestSuite} from './SchemaTestSuite';

describe('Schema', () => {
  SchemaTestSuite('postgres')
  SchemaTestSuite('mysql')
  SchemaTestSuite('mariadb')
  // SchemaTestSuite('sqlite')
});
