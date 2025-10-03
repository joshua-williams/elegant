module.exports = {
  default: 'mysql',
  connections: {
    mysql: {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'demo',
      user: 'demo_user',
      password: 'password',
    },
    postgres: {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'demo',
      user: 'demo_user',
      password: 'password',
    }
  },
  migrations: {
    table: 'migrations',
    directory: 'resources/database/migrations',
  },
  models: {
    directory: './models',
  },
}
