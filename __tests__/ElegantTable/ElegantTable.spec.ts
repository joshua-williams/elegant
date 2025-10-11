import MysqlTable from '../../lib/schema/MysqlTable';
import MariaDBTable from '../../lib/schema/MariaDBTable';
import PostgresTable from '../../lib/schema/PostgresTable';
import SqliteTable from '../../lib/schema/SqliteTable';
import {AlterTableTestSuite, CreateTableTestSuite, GetDatabaseColumnsTestSuite} from './ElegantTableTestSuite';

describe('Elegant Tables', () => {

  describe('Base Elegant Table: Create', () => {
    CreateTableTestSuite('MySQL', MysqlTable)
    CreateTableTestSuite('MariaDB', MariaDBTable)
    CreateTableTestSuite('Postgres', PostgresTable)
    CreateTableTestSuite('Sqlite', SqliteTable)
  })

  describe('Base Elegant Table: Alter', () => {
    // AlterTableTestSuite('MySQL', MysqlTable)
    // AlterTableTestSuite('MariaDB', MariaDBTable)
    // AlterTableTestSuite('Postgres', PostgresTable)
  })

  describe('Database Columns', () => {
    GetDatabaseColumnsTestSuite('MySQL', MysqlTable)
    GetDatabaseColumnsTestSuite('MariaDB', MariaDBTable)
    GetDatabaseColumnsTestSuite('Postgres', PostgresTable)
    GetDatabaseColumnsTestSuite('Sqlite', SqliteTable)
  })
});
