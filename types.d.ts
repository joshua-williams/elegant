import Elegant, {Migration} from './index.js';
import ElegantTable from './lib/schema/ElegantTable.js';
import {DropTable} from './lib/schema/DropTable.js';

type ElegantConfig = {
  default: string,
  migrations?: {
    table: string,
    directory: string,
  },
  models?: {
    directory: string,
  },
  connections: {
    [key: string]: ConnectionConfig,
  },
}
type Operator = '='|'!='|'<'|'<='|'>'|'>='|'like'|'in'|'between'|'is'|'is not'

type ConnectionConfig = {
  dialect: 'mysql' | 'mariadb' | 'postgres' | 'mssql' | 'sqlite',
  schema?: string,
  host: string,
  port: number,
  database: string,
  user: string,
  password: string,
}

type Scalar = string | number | boolean | null
type SchemaOptions = {
  autoExecute?: boolean
}
type SchemaClosure = (table:ElegantTable) => void;
type DropSchemaClosure = (table:DropTable) => void;
type MigrationMeta = {
  config:ElegantConfig,
  tables:ElegantTable[],
}

type NumericDataType =  'TINYINT'| 'SMALLINT' | 'MEDIUMINT' | 'INT' | 'INTEGER' | 'BIGINT' | 'DECIMAL' | 'FLOAT' | 'DOUBLE'
type SchemaDialect = 'mysql' | 'mariadb' | 'postgres' | 'mssql' | 'sqlite'
type ReferenceOption = 'RESTRICT'|'CASCADE'|'SET NULL'|'NO ACTION'|'SET DEFAULT'|'restrict'|'cascade'|'set null'|'no action'|'set default'
type ColumnDefinitionProperties = {
  length:number,
  column?:string,
  value?: Scalar|Scalar[],
  condition?:QueryCondition,
  default:Scalar,
  nullable:boolean,
  primary:boolean,
  unique:boolean,
  key:boolean,
  unsigned:boolean,
  autoIncrement:boolean,
  comment:string,
  collate:string,
  foreign:string[],
  table: string,
  references:Scalar[],
  onUpdate?:string,
  onDelete?:string,
}

type Charset = 'armscii8' | 'ascii' | 'big5' | 'binary' | 'cp1250' | 'cp1251' | 'cp1256' | 'cp1257' | 'cp850' | 'cp852' | 'cp866' | 'cp932' | 'dec8' | 'eucjpms' | 'euckr' | 'gb18030' | 'gb2312' | 'gbk' | 'geostd8' | 'greek' | 'hebrew' | 'hp8' | 'keybcs2' | 'koi8r' | 'koi8u' | 'latin1' | 'latin2' | 'latin5' | 'latin7' | 'macce' | 'macroman' | 'sjis' | 'swe7' | 'tis620' | 'ucs2' | 'ujis' | 'utf16' | 'utf16le' | 'utf32' | 'utf8mb3' | 'utf8mb4'
type Collation = 'armscii8_general_ci' | 'ascii_general_ci' | 'big5_chinese_ci' | 'binary' | 'cp1250_general_ci' | 'cp1251_general_ci' | 'cp1256_general_ci' | 'cp1257_general_ci' | 'cp850_general_ci' | 'cp852_general_ci' | 'cp866_general_ci' | 'cp932_japanese_ci' | 'dec8_swedish_ci' | 'eucjpms_japanese_ci' | 'euckr_korean_ci' | 'gb18030_chinese_ci' | 'gb2312_chinese_ci' | 'gbk_chinese_ci' | 'geostd8_general_ci' | 'greek_general_ci' | 'hebrew_general_ci' | 'hp8_english_ci' | 'keybcs2_general_ci' | 'koi8r_general_ci' | 'koi8u_general_ci' | 'latin1_swedish_ci' | 'latin2_general_ci' | 'latin5_turkish_ci' | 'latin7_general_ci' | 'macce_general_ci' | 'macroman_general_ci' | 'sjis_japanese_ci' | 'swe7_swedish_ci' | 'tis620_thai_ci' | 'ucs2_general_ci' | 'ujis_japanese_ci' | 'utf16_general_ci' | 'utf16le_general_ci' | 'utf32_general_ci' | 'utf8mb3_general_ci' | 'utf8mb4_0900_ai_ci';

type MigrationStatus = 'success' | 'error' | 'skip' | 'outstanding'
type MigrationFile = {
  date:Date
  status?:MigrationStatus
  name:string
  path:string
}

type MigrationFileMap = {
  migration:Migration
  file:MigrationFile
}

//@ts-ignore
declare module 'ascii-table' {
  export default class AsciiTable {
    constructor(title?: string)
    setHeading(...headings: string[]): this
    addRow(...values: any[]): this
    toString(): string
  }
}

type ElegantTableConstructor = new (tableName:string, action:ElegantTableAction, db:Elegant) => ElegantTable
type ElegantTableAction = 'create'|'alter'|'drop'
type ComparisonOperator = '=' | '<>' | '!=' | '<' | '>' | '<=' | '>=' | 'IN' | 'NOT IN' | 'LIKE' | 'BETWEEN' | 'IS NULL' | 'IS NOT NULL'
type QueryCondition = {
  column:string
  operator:ComparisonOperator
  value:Scalar|Scalar[]
}
