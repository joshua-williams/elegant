import ColumnDefinition from 'lib/schema/ColumnDefinition';
import { SchemaDialect } from 'types';
import SchemaTable from "./SchemaTable";
import {TimestampColumnDefinition} from './TableDefinitions';
import MysqlSchemaTable from './MysqlSchemaTable';

export default class MariaDbSchemaTable extends MysqlSchemaTable {}
