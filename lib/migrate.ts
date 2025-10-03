import {getAppConfig} from './config';
import {appPath, exit, resourcePath} from './util';
import fs from 'node:fs';
import {Migration} from '../index';
import path from 'node:path';

export default function migrate() {
  const config:ElegantConfig = getAppConfig()
  return runMigrations(config)

}

export const runMigrations = async (config:ElegantConfig) => {
  const migrationPath = appPath(config.migrations.directory)
  const migrationFiles = fs.readdirSync(migrationPath, {withFileTypes: true})
    .filter(file => file.isFile() && file.name.endsWith('.js',) || file.name.endsWith('.ts'))
    // .map(file => () => config.migrations.directory + '/' + file.name)
  for(const file of migrationFiles) {
    const importPath = appPath(config.migrations.directory) + '/' + file.name
    const {default:Migration} = await import(importPath)
    const migration = new Migration()
    migration.up()
    exit();
    // const MigrationClass = require(path.join(file.path, file.name))
    // const migration:Migration = new MigrationClass()

  }
  exit()
  const MigrationClass: Migration = require(migrationPath)
  // @ts-ignore
  const migration = new MigrationClass();
  console.log(migration)
}
