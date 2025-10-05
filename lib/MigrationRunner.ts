import {getAppConfig} from './config';
import {appPath} from './util';
import fs from 'node:fs';
import Elegant, {Migration, Schema} from '../index';


class MigrationResult {
  migration:string
  action: 'migration'|'rollback' = 'migration'
  status:string
  error?:string
  timestamp:number
  duration:number

  constructor(migration:string = '', action:'migration'|'rollback'='migration', status:string = 'success', error?:string, timestamp:number = Date.now(), duration:number = 0) {
    this.migration = migration
    this.action = action
    this.status = status
    this.timestamp = timestamp
    this.error = error
    this.duration = duration
  }
}

class MigrationError extends Error {
  result:MigrationResult = new MigrationResult()

  constructor(message:string, result:MigrationResult) {
    super(message)
    this.name = 'MigrationError'
    this.result = result
  }

  toString() {
    return JSON.stringify(this.result, null, 2)
  }
}

export default class MigrationRunner {
  private config:ElegantConfig;
  private migrationPath:string;

  async run(direction:'up'|'down' = 'up'):Promise<MigrationResult[]> {
    this.config = await getAppConfig()
    this.migrationPath = appPath(this.config.migrations.directory)
    const migrations = await this.getMigrations()
    try {
      return await this.runMigrations(migrations, direction)
    } catch (error) {
      console.error(error.toString())
    }
  }

  async runMigrations(migrations:Migration[], direction:'up'|'down'):Promise<MigrationResult[]> {
    const results:MigrationResult[] = []
    for (const migration of migrations) {
      const result = await this.runMigration(migration,direction)
      if (result.status === 'error') {
        let job = direction === 'up' ? 'migration' : 'rollback'
        throw new MigrationError(`Error running ${job}: ${migration.constructor.name}:\n${result.error}`, result)
      }
      results.push(result)
    }
    return results;
  }

  async runMigration(migration:Migration, direction:'up'|'down'):Promise<MigrationResult> {
    const action = direction === 'up' ? 'migration' : 'rollback'
    const result:MigrationResult = new MigrationResult(migration.constructor.name, action)
    if (!migration.shouldRun()) {
      result.status = 'skip'
      return result
    }
    try {
      direction === 'up' ? await migration.up() : await migration.down()
    } catch (error) {
      result.status = 'error'
      result.error = error.message
      return result
    }
    const connection = migration.getConnection()
    const db = await Elegant.connection(connection)

    const executeMigrationQueries = async (db:Elegant) => {
      for (const table of migration.schema.tables) {
        const sql = table.toSql()
        await db.query(sql)
        result.duration = Date.now() - result.timestamp
      }
    }

    try {
      await db.transaction(executeMigrationQueries)
    } catch (error) {
      result.status = 'error'
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
