import MysqlTable from '../../lib/schema/MysqlTable.js';
import MariaDBTable from '../../lib/schema/MariaDBTable.js';
import PostgresTable from '../../lib/schema/PostgresTable.js';
import SqliteTable from '../../lib/schema/SqliteTable.js';
import {AlterTableTestSuite, CreateTableTestSuite, GetDatabaseColumnsTestSuite} from './ElegantTableTestSuite.js';

describe('Elegant Tables', () => {

  describe('Base Elegant Table: Create', () => {
    CreateTableTestSuite('MySQL', MysqlTable)
    CreateTableTestSuite('MariaDB', MariaDBTable)
    CreateTableTestSuite('Postgres', PostgresTable)
    CreateTableTestSuite('Sqlite', SqliteTable)
  })

  describe('Base Elegant Table: Alter', () => {
    AlterTableTestSuite('MySQL', MysqlTable)
    AlterTableTestSuite('MariaDB', MariaDBTable)
    AlterTableTestSuite('Postgres', PostgresTable)
  })

  describe('Database Columns', () => {
    GetDatabaseColumnsTestSuite('MySQL', MysqlTable)
    GetDatabaseColumnsTestSuite('Postgres', PostgresTable)
    GetDatabaseColumnsTestSuite('Sqlite', SqliteTable)
    GetDatabaseColumnsTestSuite('MariaDB', MariaDBTable)
  })
});
