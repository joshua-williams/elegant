import {Command} from 'commander'
import {getConfig, getConfigString} from '../lib/config.js';
import {appPath} from '../lib/util.js';
import * as fs from 'node:fs';
import path from 'node:path';

export default new Command('init')
  .description('Initialize a new Elegant project')
  .option('-m, --migration', 'Configure database migration')
  .option('-p, --migration-path <migrationPath>', 'Path to migration directory', 'resources/database/migrations')
  .option('-s, --seed', 'Configure database seed')
  .option('-e, --seed-path <seedPath>', 'Path to seed directory')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    const config = getConfig()
    initializeMigration(options, config)
    initializeSeed(options, config)
    initializeConfig(options, config)
  })

const initializeSeed = (options, config) => {
  const {seed, seedPath, force } = options
  const defaultSeedPath = 'resources/database/seeds'
  let seedDir:string;
  if (seed || seedPath) {
    seedDir = seedPath ? seedPath : appPath(defaultSeedPath)
    if (fs.existsSync(seedDir)) {
      if (force) {
        fs.rmSync(seedDir, {recursive: true})
        fs.mkdirSync(seedDir)
        console.log(`Created seed directory at ${seedDir}`)
      } else {
        console.error(`Seed directory already exists at ${seedDir}`)
      }
    } else {
      fs.mkdirSync(seedDir, {recursive: true})
      console.info(`Created migration directory at ${seedDir}`)

    }
  } else {
    delete config.seeds
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

const initializeMigration = (options, config) => {
  const {migration, migrationPath} = options

  if (migration || migrationPath) {
    const migrationDirectory = migrationPath ? migrationPath : appPath(config.migrations.directory)

    if (fs.existsSync(migrationDirectory)) {
      if (options.force) {
        fs.rmSync(migrationDirectory, {recursive: true})
        fs.mkdirSync(migrationDirectory)
        fs.writeFileSync(path.join(migrationDirectory, '.state'), '', 'utf8')
        console.log(`Created migration directory at ${migrationDirectory}`)
      } else {
        console.error(`Migration directory already exists at ${migrationDirectory}`)
      }
    } else {
      fs.mkdirSync(migrationDirectory, {recursive: true})
      fs.writeFileSync(path.join(migrationDirectory, '.state'), '', 'utf8')
      console.info(`Created migration directory at ${migrationDirectory}`)
    }
  } else {
    delete config.migrations
  }
}
