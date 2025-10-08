import MysqlTable from '../../lib/schema/MysqlTable';
import MariaDBTable from '../../lib/schema/MariaDBTable';
import PostgresTable from '../../lib/schema/PostgresTable';
import {runDateTimeTestSuite, runNumberTestSuite, runStringTestSuite} from './ElegantTestSuite';

describe('Elegant Tables', () => {

  describe('Base Elegant Table', () => {
    runStringTestSuite('MySQL', MysqlTable)
    runNumberTestSuite('MySQL', MysqlTable)
    runDateTimeTestSuite('MySQL', MysqlTable)

    runStringTestSuite('MariaDB', MariaDBTable)
    runNumberTestSuite('MariaDB', MariaDBTable)
    runDateTimeTestSuite('MariaDB', MariaDBTable)

    runStringTestSuite('Postgres', PostgresTable)
    runNumberTestSuite('Postgres', PostgresTable)
    runDateTimeTestSuite('Postgres', PostgresTable)

  })
});
