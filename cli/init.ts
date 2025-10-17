import {Command} from 'commander'
import {getConfig, getConfigString} from '../lib/config.js';
import {appPath, isTypescript, resourcePath} from '../lib/util.js';
import * as fs from 'node:fs';
import path, {basename} from 'node:path';
import inquirer from 'inquirer';

export default new Command('init')
  .description('Initialize a new Elegant project')
  .option('-m, --migration-dir <migrationDir>', 'Path to migration directory', 'resources/database/migrations')
  .option('-d, --dialect <dialect>')
  .option('-i, --interactive', 'Interactively configure project settings')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    if (options.interactive) {
      await runInteractiveConfiguration(options)
    } else {
      const config = getConfig()
      initializeConfig(options, config)
    }
  })

const runInteractiveConfiguration = async (options) => {
  const {default:config} = await import(resourcePath('elegant.config.js'))
  const {dialect} = await getDialect()
  config.default = dialect.toLowerCase()
  switch (config.default) {
    case 'sqlite': {
      const connectionConfig = await getSqliteConfig()
      config.connections = {sqlite: connectionConfig}
      break;
    }
    case 'postgres':
    case 'mysql':
    case 'mariadb': {
      const connectionConfig = await getDbCredentials(dialect)
      config.connections = {[config.default]:connectionConfig}
      break;
    }
  }
  initializeResourceDirectory(options, config)
}

const getSqliteConfig = async () => {
  const questions = [
    {
      type: 'input',
      name: 'path',
      message: 'Enter your database path:',
      default: "resources/database/databases"
    },
    {
      type: 'input',
      name: 'database',
      message: 'Enter your database name:',
      default: path.basename(process.cwd()),
    }
  ]
  // @ts-ignore
  return await inquirer.prompt(questions)
}

const getDialect = async () => {
  const question = [
    {
      type: 'list',
      name: 'dialect',
      message: 'Select your database dialect:',
      choices: ['MySQL', 'MariaDB','Postgres', 'SQLite'],
      default: 'SQLite',
    },
  ];
  // @ts-ignore
  return await inquirer.prompt(question);
}

const getDbCredentials = async (dialect) => {
  const questions:any[] = [
    {
      type: 'input',
      name: 'host',
      message: 'Enter your database hostname:',
      default: 'localhost',
    },
  ];
  if (dialect.toLowerCase() !== 'sqlite') {
    let port = dialect.toLowerCase() === 'postgres' ? 5432 : 3306
    questions.push({
      type: 'input',
      name: 'port',
      message: 'Enter your database port:',
      default: port,
    })
  }
  questions.push({
    type: 'input',
    name: 'database',
    message: 'Enter your database name:',
    validate: (value) => value.length > 0 || 'Please enter a database name.',
  })
  if (dialect.toLowerCase() === 'postgres') {
    questions.push({
      type: 'input',
      name: 'schema',
      message: 'Enter your database schema:',
      validate: (value:string) => value.length > 0 || 'Please enter a schema name.',
    })
  }
  questions.push({
      type: 'input',
      name: 'user',
      message: 'Enter your database username:',
      validate: (value:string) => value.length > 0 || 'Please enter a username.',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your database password:',
      mask: '*', // Hides the input
    },)
  try {
    // @ts-ignore
    return await inquirer.prompt(questions);
  } catch (error) {
    if (error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
      console.error('Prompt could not be rendered in this environment.', error);
    } else {
      // Something else went wrong
      console.error('An error occurred:', error);
    }
  }
}

const initializeConfig = (options, config) => {
  const configString = getConfigString()
  const configPath = appPath('elegant.config.js')

  if (fs.existsSync(configPath)) {
    if (options.force) {
      fs.rmSync(configPath)
      fs.writeFileSync(configPath, configString, 'utf8')
    } else {
      console.error('Elegant configuration file already exists')
    }
  } else {
    fs.writeFileSync(configPath, configString, 'utf8')
    console.info(`Created Elegant configuration file at ${configPath}`)
  }
}

const initializeResourceDirectory = (options, config) => {
  // Create migrations directory
  let migrationDir:string = options.migrationDir ? appPath(options.migrationDir) : appPath(config.migrations.directory)
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, {recursive: true})
  }
  // Copy elegant.config.js
  let configPath =  appPath('elegant.config.js')
  const configString = buildConfig(config)
  fs.writeFileSync(configPath, configString, 'utf8')

  // Copy .env
  const dotEnvString = buildDotEnv(config)
  const dotEnvPath = appPath('.env')
  fs.writeFileSync(dotEnvPath, dotEnvString)

  // Copy Elegant database migration file
  let migr8Path = resourcePath('database/migrations/CreateElegantMigrationTable') + (isTypescript() ? '.ts' : '.js')
  let targetPath =  path.join(migrationDir, basename(migr8Path))
  fs.copyFileSync(migr8Path, targetPath)
}
const buildDotEnv = (config:any) => {
  if (config.default === 'sqlite') return
  const c = config.connections[config.default]
  const vars:any = {
    DB_HOST: c.host,
    DB_PORT: c.port,
    DB_DATABASE: c.database,
    DB_USER: c.user,
    DB_PASSWORD: c.password,
  }
  if (config.default === 'postgres') vars.DB_SCHEMA = config.schema
  return Object.keys(vars)
    .map(key => `${key}=${vars[key]}`)
    .join('\n')
}

const buildConfig = (config:any) => {
  let configString = fs.readFileSync(resourcePath('templates/elegant.config.tpl.js'), 'utf8')
  const templateVariables = {
    connection: config.default,
    dialect: config.default,
    schema: 'process.env.DB_SCHEMA',
    host: 'process.env.DB_HOST',
    port: 'process.env.DB_PORT',
    database: 'process.env.DB_DATABASE',
    user: 'process.env.DB_USER',
    password: 'process.env.DB_PASSWORD',
  }
  Object.keys(templateVariables).forEach(key => {
    configString = configString.replaceAll(`{{${key}}}`, templateVariables[key])
  })
  if (config.default === 'sqlite') {
    return removeConnectionConfigSection(configString, 'database')
  } else {
    configString = removeConnectionConfigSection(configString, 'sqlite')
    if (config.default !== 'postgres') {
      return configString.split('\n')
        .filter((line:string) => !line.includes('schema:'))
        .join('\n')
    }
    return configString
  }
}

const removeConnectionConfigSection = (s:string, section:'sqlite'|'database') => {
  const startIndex = s.indexOf(`[${section}]`)
  let placeholder = `[end ${section}]`
  let endIndex = s.indexOf(placeholder) + placeholder.length
  let str = s.substring(0, startIndex)
  str += s.substring(endIndex)
  placeholder = section == 'sqlite' ? 'database' : 'sqlite'
  str = str.replace(`[${placeholder}]`, '')
  str = str.replace(`[end ${placeholder}]`, '')
  str = str.replaceAll(/\n+/g,'\n')
  return str
}
