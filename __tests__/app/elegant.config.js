module.exports = {
  default: 'forecastcrm',
  connections: {
    forecastcrm: {
      driver: 'mysql2',
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
  models: {
    directory: './models',
  },
}
