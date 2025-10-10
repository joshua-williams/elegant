import MysqlTable from '../../lib/schema/MysqlTable';
import MariaDBTable from '../../lib/schema/MariaDBTable';
import PostgresTable from '../../lib/schema/PostgresTable';
import {AlterTableTestSuite, CreateTableTestSuite} from './ElegantTableTestSuite';

describe('Elegant Tables', () => {

  describe('Base Elegant Table: Create', () => {
    CreateTableTestSuite('MySQL', MysqlTable)
    CreateTableTestSuite('MySQL', MariaDBTable)
    CreateTableTestSuite('Postgres', PostgresTable)
  })

  describe('Base Elegant Table: Alter', () => {
    // AlterTableTestSuite('MySQL', MysqlTable)
    // AlterTableTestSuite('MariaDB', MariaDBTable)
    // AlterTableTestSuite('Postgres', PostgresTable)
  })
});
