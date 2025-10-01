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
  driver: 'sqlite3' | 'mysql2' | 'pg',
  host: string,
  port: number,
  database: string,
  user: string,
  password: string,
}

type Scalar = string | number | boolean | null
