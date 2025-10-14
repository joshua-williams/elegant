export default {
  default: 'mysql',
  connections: {
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
    directory: 'resources/database/models',
  },
}
