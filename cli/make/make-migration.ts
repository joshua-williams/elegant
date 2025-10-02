import {Command} from 'commander'
import {appPath, getTemplate, isTypescript} from '../../lib/util';
import * as fs from 'node:fs';
import {getAppConfig} from '../../lib/config';
import path from 'node:path';

export default new Command('make:migration')
  .description('create database migrations')
  .argument('<name>', 'migration name')
  .action(async (name:string, options) => {
    const config = getAppConfig()
    const targetName = `${Date.now()}_${name}` + (isTypescript() ? '.ts' : '.js')
    const targetPath = path.resolve(appPath(config.migrations.directory), targetName)
    const migrationDir = path.dirname(targetPath)
    if (!fs.existsSync(migrationDir)) fs.mkdirSync(migrationDir, {recursive: true})
    const template = getTemplate('migration')
      .replace('MigrationClass', name)
    fs.writeFileSync(targetPath, template)
  })


