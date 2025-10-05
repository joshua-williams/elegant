import Elegant from '../index';
import {BaseMigration} from './BaseMigration';
import fs from 'node:fs';
import {MigrationFileMap} from '../types';


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

export default class MigrationRunner extends BaseMigration {

  public async run(direction:'up'|'down' = 'up'):Promise<MigrationResult[]> {
    const migrations = await this.getMigrations()
    let results:MigrationResult[] = []
    try {
      results = await this.runMigrations(migrations, direction)
    } catch (error) {
      console.error(error.toString())
    }
    return results
  }

  private async runMigrations(maps:MigrationFileMap[], direction:'up'|'down'):Promise<MigrationResult[]> {
    const results:MigrationResult[] = []
    const lastRanMigration = this.getLastRanMigration()

    maps = maps.filter(map => map.constructor.shouldRun())
      .filter(map => {
        if (direction === 'up' && this.getMigrationStatus(lastRanMigration, map.file) === 'outstanding') return true
      })

    for (const migrationMap of maps) {
      const result = await this.runMigration(migrationMap,direction)
      if (result.status === 'error') {
        let job = direction === 'up' ? 'migration' : 'rollback'
        throw new MigrationError(`Error running ${job}: ${migrationMap.constructor.constructor.name}:\n${result.error}`, result)
      }
      results.push(result)
    }
    if (results.length) this.saveState(maps[maps.length - 1])
    return results;
  }

  private async runMigration(map:MigrationFileMap, direction:'up'|'down'):Promise<MigrationResult> {
    const migration = map.constructor
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

    if (direction === 'down') {
      this.clearState()
    }
    return result
  }



  private clearState() {
    fs.writeFileSync(`${this.migrationPath}/.state`, '')
  }
  private saveState(map:MigrationFileMap) {
    const statePath = `${this.migrationPath}/.state`
    fs.writeFileSync(statePath, map.file.path)
  }

}
