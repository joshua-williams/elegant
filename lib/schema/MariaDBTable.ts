import ColumnDefinition from 'lib/schema/ColumnDefinition';
import { SchemaDialect } from 'types';
import ElegantTable from "./ElegantTable";
import {TimestampColumnDefinition} from './TableDefinitions';
import MysqlTable from './MysqlTable';

export default class MariaDBTable extends MysqlTable {}
