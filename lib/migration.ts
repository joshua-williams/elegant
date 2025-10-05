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
      await down(migrations)
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
      await db.query(sql)
    }
  }
}

export const down = async (migrations:Migration[]) => {
  for(const migration of migrations) {
    await migration.down()
    const connection = migration.getConnection()
    const db = await Elegant.connection(connection)
    for (const table of migration.schema.tables) {
      const sql = table.toSql()
      await db.query(sql)
    }
  }
}

export const migrationPath = (config:ElegantConfig) => appPath(config.migrations.directory)

export const getMigrations = async ( config:ElegantConfig ) => {
  const migrationFiles = getMigrationFiles(config)
  const migrations:Migration[] = []
  for (const file of migrationFiles) {
    const {default:Migration} = await import(`${migrationPath(config)}/${file}`)
    const schema = new Schema(config)
    const migration = new Migration(schema)
    migrations.push(migration)
  }
  return migrations
}

export const getMigrationFiles = (config:ElegantConfig) =>
  fs.readdirSync(migrationPath(config))
    .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))

export default run
