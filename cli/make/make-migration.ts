import {Command} from 'commander'
import {appPath, getTemplate, isTypescript} from '../../lib/util';
import * as fs from 'node:fs';
import {getAppConfig} from '../../lib/config';
import path from 'node:path';

export default new Command('make:migration')
  .description('create database migrations')
  .argument('<name>', 'migration name')
  .option('-d, --migrationDir <migrationDir>', 'miration directory')
  .action(async (name: string, options) => {
    const config = getAppConfig()
    const targetName = `${Date.now()}.${name}.migration` + (isTypescript() ? '.ts' : '.js')
    const migrationDir = appPath(options.migrationDir ? options.migrationDir : config.migrations.directory)
    const migrationPath = path.resolve(migrationDir, targetName)
    if (!fs.existsSync(migrationDir)) fs.mkdirSync(migrationDir, {recursive: true})
    const template = getTemplate('migration')
      .replace('MigrationClass', name)
    fs.writeFileSync(migrationPath, template)
  })


