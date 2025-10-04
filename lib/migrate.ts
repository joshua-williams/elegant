import {getAppConfig} from './config';
import {appPath, exit, resourcePath} from './util';
import fs from 'node:fs';
import {Migration} from '../index';

export const run = async (direction:'up'|'down' = 'up') => {
  const config:ElegantConfig = await getAppConfig()
  switch (direction) {
    case 'up':
      return await getMigrations(config)
      break;
    case 'down':

      break;
  }
}

export const up = async (migration:Migration, config:ElegantConfig) => {
  console.log('migration up')
  await migration.up()
}

export const down = (config:ElegantConfig) => {

}

const migrationPath = (config:ElegantConfig) => appPath(config.migrations.directory)

const getMigrations = async (config:ElegantConfig) => {
  const migrationFiles = getMigrationFiles(config)
  const migrations:Migration[] = []
  for (const file of migrationFiles) {
    const {default:Migration} = await import(`${migrationPath(config)}/${file}`)
    migrations.push(new Migration())
  }
  return migrations
}

const getMigrationFiles = (config:ElegantConfig) =>
  fs.readdirSync(migrationPath(config))
    .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))

