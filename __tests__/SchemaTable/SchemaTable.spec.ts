import MysqlSchemaTable from '../../lib/schema/MysqlSchemaTable';
import MariaDbSchemaTable from '../../lib/schema/MariaDbSchemaTable';
import PostgresSchemaTable from '../../lib/schema/PostgresSchemaTable';
import {runDateTimeTestSuite, runNumberTestSuite, runStringTestSuite} from './SchemaTestSuite';

describe('SchemaTables', () => {

  describe('Base SchemaTable', () => {
    runStringTestSuite('MySQL', MysqlSchemaTable)
    runNumberTestSuite('MySQL', MysqlSchemaTable)
    runDateTimeTestSuite('MySQL', MysqlSchemaTable)

    runStringTestSuite('MariaDB', MariaDbSchemaTable)
    runNumberTestSuite('MariaDB', MariaDbSchemaTable)
    runDateTimeTestSuite('MariaDB', MariaDbSchemaTable)

    runStringTestSuite('Postgres', PostgresSchemaTable)
    runNumberTestSuite('Postgres', PostgresSchemaTable)
    runDateTimeTestSuite('Postgres', PostgresSchemaTable)

  })
});
