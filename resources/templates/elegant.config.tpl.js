export default {
  default: '{{connection}}',
  connections: {
[sqlite]
    {{connection}}: {
      dialect: 'sqlite',
      database: 'resources/database/app.db'
    },
[end sqlite]
[database]
  {{connection}}: {
      dialect: '{{dialect}}',
      schema: {{schema}},
      host: {{host}},
      port: {{port}},
      database: {{database}},
      user: {{user}},
      password: {{password}},
    },
[end database]
  },
  migrations: {
    table: 'migrations',
    directory: '{{migrationDirectory}}',
  },
  seeds: {
    directory: 'resources/database/seeds',
  },
  models: {
    strictAttributes: false,
    lazyLoading: false,
    directory: 'resources/database/models',
  }
}
