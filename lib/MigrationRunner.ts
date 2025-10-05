import {getAppConfig} from './config';
import {appPath} from './util';
import fs from 'node:fs';
import Elegant, {Migration, Schema} from '../index';

type MigrationResult = {
  migration:string,
  result:string,
  error?:string,
  timestamp:number,
  duration:number,
}
export default class MigrationRunner {
  private config:ElegantConfig;
  private results:MigrationResult[] = [];
  private migrationPath:string;

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
    console.log(JSON.stringify(this.results, null, 2))
  }

  async up(migrations: Migration[]):Promise<void> {
    for (const migration of migrations) {
      const result:MigrationResult = {
        migration: migration.constructor.name,
        result: 'success',
        timestamp: Date.now(),
        duration: 0,
      }
      if (!migration.shouldRun()) {
        result.result = 'skip'
        this.results.push(result)
        continue
      }
      await migration.up()
      const connection = migration.getConnection()
      const db = await Elegant.connection(connection)
      try {
        for (const table of migration.schema.tables) {
          const sql = table.toSql()
          await db.query(sql)
          result.duration = Date.now() - result.timestamp
          this.results.push(result)
        }
      } catch (error) {
        await db.close()
        result.result = 'error'
        result.error = error.message
        this.results.push(result)
      }
      await db.close()
    }
  }

  async down (migrations:Migration[]):Promise<void> {
    for(const migration of migrations) {
      const result:MigrationResult = {
        migration: migration.constructor.name,
        result: 'success',
        timestamp: Date.now(),
        duration: 0,
      }
      if (!migration.shouldRun()) {
        result.result = 'skip'
        this.results.push(result)
        continue
      }
      await migration.down()
      const connection = migration.getConnection()
      const db = await Elegant.connection(connection)
      try {
        for (const table of migration.schema.tables) {
          const sql = table.toSql()
          await db.query(sql)
          result.duration = Date.now() - result.timestamp
          this.results.push(result)
        }
      } catch (error) {
        await db.close()
        result.result = 'error'
        result.error = error.message
        this.results.push(result)
      }
      await db.close()
    }
  }

  async getMigrations():Promise<Migration[]> {
    const migrationFiles = this.getMigrationFiles()
    const migrations:Migration[] = []
    for (const file of migrationFiles) {
      const {default:MigrationClass} = await import(`${this.migrationPath}/${file}`)
      const schema = new Schema(this.config)
      const migration:Migration = new MigrationClass(schema)
      migrations.push(migration)
    }
    return migrations
  }

  private getMigrationFiles():string[] {
    return fs.readdirSync(this.migrationPath)
      .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))
  }

}
