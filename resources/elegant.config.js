module.exports = {
  default: 'mysql',
  connections: {
    mysql: {
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      database: 'forecastcrm',
      user: 'forecastcrm',
      password: 'password',
    }
  },
  migrations: {
    table: 'migrations',
    directory: './migrations',
  },
  seeds: {
    directory: './seeds',
  },
  models: {
    directory: './models',
  },
}
