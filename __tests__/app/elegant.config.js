module.exports = {
  default: 'forecastcrm',
  connections: {
    mysql: {
      driver: 'mysql2',
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
