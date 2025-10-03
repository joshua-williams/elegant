
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
  host: string,
  port: number,
  database: string,
  user: string,
  password: string,
}

type Scalar = string | number | boolean | null
type SchemaClosure = (table) => void;
type NumericDataType =  'TINYINT'| 'SMALLINT' | 'MEDIUMINT' | 'INT' | 'BIGINT' | 'DECIMAL' | 'FLOAT'
type SchemaDialect = 'mysql' | 'mariadb' | 'postgres' | 'mssql' | 'sqlite'
type ColumnDefinitionProperties = {
  length:number,
  default:Scalar,
  nullable:boolean,
  primary:boolean,
  unique:boolean,
  key:boolean,
  unsigned:boolean,
  autoIncrement:boolean,
  comment:string,
  collate:string
}

type Charset = 'armscii8' | 'ascii' | 'big5' | 'binary' | 'cp1250' | 'cp1251' | 'cp1256' | 'cp1257' | 'cp850' | 'cp852' | 'cp866' | 'cp932' | 'dec8' | 'eucjpms' | 'euckr' | 'gb18030' | 'gb2312' | 'gbk' | 'geostd8' | 'greek' | 'hebrew' | 'hp8' | 'keybcs2' | 'koi8r' | 'koi8u' | 'latin1' | 'latin2' | 'latin5' | 'latin7' | 'macce' | 'macroman' | 'sjis' | 'swe7' | 'tis620' | 'ucs2' | 'ujis' | 'utf16' | 'utf16le' | 'utf32' | 'utf8mb3' | 'utf8mb4'
type Collation = 'armscii8_general_ci' | 'ascii_general_ci' | 'big5_chinese_ci' | 'binary' | 'cp1250_general_ci' | 'cp1251_general_ci' | 'cp1256_general_ci' | 'cp1257_general_ci' | 'cp850_general_ci' | 'cp852_general_ci' | 'cp866_general_ci' | 'cp932_japanese_ci' | 'dec8_swedish_ci' | 'eucjpms_japanese_ci' | 'euckr_korean_ci' | 'gb18030_chinese_ci' | 'gb2312_chinese_ci' | 'gbk_chinese_ci' | 'geostd8_general_ci' | 'greek_general_ci' | 'hebrew_general_ci' | 'hp8_english_ci' | 'keybcs2_general_ci' | 'koi8r_general_ci' | 'koi8u_general_ci' | 'latin1_swedish_ci' | 'latin2_general_ci' | 'latin5_turkish_ci' | 'latin7_general_ci' | 'macce_general_ci' | 'macroman_general_ci' | 'sjis_japanese_ci' | 'swe7_swedish_ci' | 'tis620_thai_ci' | 'ucs2_general_ci' | 'ujis_japanese_ci' | 'utf16_general_ci' | 'utf16le_general_ci' | 'utf32_general_ci' | 'utf8mb3_general_ci' | 'utf8mb4_0900_ai_ci';
