import {Command} from 'commander'
import {getConfig, getConfigString} from '../lib/config.js';
import {appPath, isTypescript, resourcePath} from '../lib/util.js';
import * as fs from 'node:fs';
import path, {basename} from 'node:path';

export default new Command('init')
  .description('Initialize a new Elegant project')
  .option('-m, --migration-dir <migrationDir>', 'Path to migration directory', 'resources/database/migrations')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    const config = getConfig()
    initializeResourceDirectory(options, config)
    initializeConfig(options, config)
  })


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
  let migrationDir:string = options.migrationDir ? appPath(options.migrationDir) : appPath('resources/database/migrations')
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, {recursive: true})
  }
  let sourcePath = resourcePath('database/migrations/CreateMigrationsTable') + (isTypescript() ? '.ts' : '.js')
  let targetPath =  path.join(migrationDir, basename(sourcePath))
  fs.copyFileSync(sourcePath, targetPath)

}
