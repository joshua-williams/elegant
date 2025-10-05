import {getAppConfig} from './config';
import {appPath} from './util';
import fs from 'node:fs';
import Elegant, {Migration, Schema} from '../index';

export default class MigrationRunner {
  private config:ElegantConfig;
  migrationPath:string;

  async run(direction:'up'|'down' = 'up'):Promise<void> {
    this.config = await getAppConfig()
    this.migrationPath = appPath(this.config.migrations.directory)
    const migrations = await this.getMigrations()
    switch(direction) {
    case 'up':
      await this.up(migrations)
      break;
    case 'down':
      await this.down(migrations)
      break;
    }
  }

  async up(migrations: Migration[]):Promise<void> {
    for (const migration of migrations) {
      await migration.up()
      const connection = migration.getConnection()
      const db = await Elegant.connection(connection)
      try {
        for (const table of migration.schema.tables) {
          const sql = table.toSql()
          await db.query(sql)
        }
      } catch (error) {
        await db.close()
        console.log(`Migrating ${migration.constructor.name} failed. ${error.message}`)
      }
      await db.close()
    }
  }

  async down (migrations:Migration[]):Promise<void> {
    for(const migration of migrations) {
      await migration.down()
      const connection = migration.getConnection()
      const db = await Elegant.connection(connection)
      try {
        for (const table of migration.schema.tables) {
          const sql = table.toSql()
          await db.query(sql)
        }
      } catch (error) {
        await db.close()
        console.log(`Rolling back ${migration.constructor.name} failed. ${error.message}`)
      }
      await db.close()
    }
  }

  async getMigrations():Promise<Migration[]> {
    const migrationFiles = this.getMigrationFiles()
    const migrations:Migration[] = []
    for (const file of migrationFiles) {
      const {default:Migration} = await import(`${this.migrationPath}/${file}`)
      const schema = new Schema(this.config)
      const migration = new Migration(schema)
      migrations.push(migration)
    }
    return migrations
  }

  private getMigrationFiles():string[] {
    return fs.readdirSync(this.migrationPath)
      .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))
  }

}
