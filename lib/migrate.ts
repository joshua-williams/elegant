import {getAppConfig} from './config';
import {appPath, exit, resourcePath} from './util';
import fs from 'node:fs';
import {Migration} from '../index';
import path from 'node:path';

export const run = (direction:'up'|'down' = 'up') => {
  const config:ElegantConfig = getAppConfig()
  switch (direction) {
    case 'up': up(config); break;
    case 'down': down(config); break;
  }
}

export const up = async (migration:Migration, config:ElegantConfig) => {
  console.log('migration up')
  await migration.up()
}

export const down = (config:ElegantConfig) => {

}

const getMigrationFiles = (config:ElegantConfig) => {
  const migrationPath = appPath(config.migrations.directory)
  const files = fs.readdirSync(migrationPath, {withFileTypes: true})
    .filter(file => file.isFile() && file.name.endsWith('.js',) || file.name.endsWith('.ts'))
    .map(file => () => {
      const importPath = appPath(config.migrations.directory) + '/' + file.name
      const {default: Migration} = require(importPath)
      return new Migration()
    })
  return files
  console.log(files)
}
