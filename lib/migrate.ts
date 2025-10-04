import {getAppConfig} from './config';
import {appPath, exit, resourcePath} from './util';
import fs from 'node:fs';
import Elegant, {Migration, Schema} from '../index';
import {config} from 'dotenv';

export const run = async (direction:'up'|'down' = 'up') => {
  const config:ElegantConfig = await getAppConfig()
  const migrations = await getMigrations(config)
  switch(direction) {
    case 'up':
      await up(migrations)
      break;
    case 'down':
      // run migrations down
      break;
  }
}

export const up = async (migrations:Migration[]) => {
  for (const migration of migrations) {
    await migration.up()
    const connection = migration.getConnection()
    const db = await Elegant.connection(connection)
    for (const table of migration.schema.tables) {
      const sql = table.toSql()
      const results = await db.query(sql)
      console.log(results, sql)
    }
  }
}

export const down = (config:ElegantConfig) => {

}

const migrationPath = (config:ElegantConfig) => appPath(config.migrations.directory)

const getMigrations = async ( config:ElegantConfig ) => {
  const migrationFiles = getMigrationFiles(config)
  const migrations:Migration[] = []
  for (const file of migrationFiles) {
    const {default:Migration} = await import(`${migrationPath(config)}/${file}`)
    migrations.push(new Migration(new Schema(config)))
  }
  return migrations
}

const getMigrationFiles = (config:ElegantConfig) =>
  fs.readdirSync(migrationPath(config))
    .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))

export default run
