export default{
  default: 'mysql',
  connections: {
    sqlite: {
      schema: 'elegant',
      dialect: 'sqlite',
      database: 'resources/database/database.sqlite'
    },
    postgres: {
      schema: 'elegant',
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'elegant',
      user: 'root',
      password: 'password',
    },
    mariadb: {
      dialect: 'mariadb',
      host: 'localhost',
      port: 3333,
      database: 'elegant',
      user: 'root',
      password: 'password',
    },
    mysql: {
      dialect: 'mysql',
      host: 'localhost',
      port: 3333,
      database: 'elegant',
      user: 'root',
      password: 'password',
    }
  },
  migrations: {
    table: 'migrations',
    directory: 'resources/database/migrations',
  },
  seeds: {
    directory: 'resources/database/seeds',
  },
  models: {
    directory: 'resources/database/models',
  },
}
