export default {
  default: 'mysql',
  connections: {
    sqlite: {
      dialect: 'sqlite',
      database: 'resources/database/app.db'
    },
    postgres: {
      dialect: 'postgres',
      schema: 'app',
      host: 'localhost',
      port: 3306,
      database: 'elegant',
      user: 'elegant',
      password: 'password',
    },
    mysql: {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'elegant',
      user: 'elegant',
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
    lazyLoading: false,
    directory: 'resources/database/models',
  }
}
