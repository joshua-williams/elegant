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
  private migrationPath:string;

  async run(direction:'up'|'down' = 'up'):Promise<void> {
    this.config = await getAppConfig()
    this.migrationPath = appPath(this.config.migrations.directory)
    const migrations = await this.getMigrations()
    const results = await this.runMigrations(migrations, direction)
    console.log(JSON.stringify(results, null, 2))
  }
  async runMigrations(migrations:Migration[], direction:'up'|'down'):Promise<MigrationResult[]> {
    const results:MigrationResult[] = []
    for (const migration of migrations) {
      const result = await this.runMigration(migration, direction)
      results.push(result)
    }
    return results;
  }

  async runMigration(migration:Migration, direction:'up'|'down'):Promise<MigrationResult> {
    console.log(`Running ${direction} migration: ${migration.constructor.name}`)
    const result:MigrationResult = {
      migration: migration.constructor.name,
      result: 'success',
      timestamp: Date.now(),
      duration: 0,
    }
    if (!migration.shouldRun()) {
      result.result = 'skip'
      return result
    }
    try {
      direction === 'up' ? await migration.up() : await migration.down()
    } catch (error) {
      result.result = 'error'
      result.error = error.message
    }
    const connection = migration.getConnection()
    const db = await Elegant.connection(connection)
    try {
      for (const table of migration.schema.tables) {
        const sql = table.toSql()
        await db.query(sql)
        result.duration = Date.now() - result.timestamp
      }
    } catch (error) {
      await db.close()
      result.result = 'error'
      result.error = error.message
    }
    await db.close()
    return result
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
