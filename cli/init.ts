import {Command} from 'commander'
import {getConfig, getConfigString} from '../src/config';
import {appPath, exit} from '../lib/util';
import * as fs from 'node:fs';

export default new Command('init')
  .description('Initialize a new Elegant project')
  .option('-m, --migration', 'Configure database migration')
  .option('-f, --force', 'Overwrite existing files')
  .action(async (options) => {
    console.log('Initializing a new elegant project...')
    const config = getConfig()
    if (options.migration) {
      const configPath = appPath(config.migrations.directory)
      if (fs.existsSync(configPath)) {
        if (options.force) {
          fs.rmSync(configPath, {recursive: true})
          fs.mkdirSync(configPath)
          console.log(`Created migration directory at ${configPath}`)
        } else {
          console.error(`Migration directory already exists at ${configPath}`)
        }
      } else {
        fs.mkdirSync(configPath, {recursive: true})
        console.info(`Created migration directory at ${configPath}`)
      }
    } else {
      delete config.migrations
    }

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

  })
