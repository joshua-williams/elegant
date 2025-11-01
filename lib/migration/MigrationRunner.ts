import Elegant, {Migration} from '../../index.js';
import {MigrationManager} from './MigrationManager.js';
import MigrationResult from './MigrationResult.js';
import { ConnectionConfig} from '../../types.js';
import {getAppConfig} from '../config.js';

type MigrationFinalResult = {
  result: boolean,
  duration: number,
  error: Error,
  message: string,
  culprit:MigrationResult,
  statement: string
  results: Map<Migration, MigrationResult>
  rollbackResults: Map<Migration, MigrationResult>
}

export default class MigrationRunner extends MigrationManager {

  public async run() {
    const finalResult:MigrationFinalResult = {
      result: false,
      duration: undefined,
      error: undefined,
      message: '',
      culprit: undefined,
      statement: '',
      results: new Map(),
      rollbackResults: new Map()
    }
    const migrationTimestamp:number = Date.now()
    const filter = await this.migrationFilter()
    const migrationFileMaps = (await this.migrationFileMap({filter}))
    const migrationsRan:Migration[] = []
    for (const migrationFileMap of migrationFileMaps) {
      const timestamp = Date.now()
      const {migration, file} = migrationFileMap
      const migrationTimestamp = file.date.getTime()
      const migrationResult:MigrationResult = new MigrationResult({
        name: migration.constructor.name,
        batchId: migrationTimestamp,
        action: 'migrate',
        status: 'error',
        timestamp: migrationTimestamp,
        error: undefined,
        statement: undefined,
        created_at: undefined,
        duration: Date.now() - migrationTimestamp
      });
      const connection = (migration as any).connection
      const db = await Elegant.singleton(connection)

      migration.schema.$.autoExecute = false
      migration.schema.reset()

      if (!migration.shouldRun()) {
        migrationResult.status = 'skip'
        finalResult.results.set(migration, migrationResult)
        continue
      }
      try {
        await migration.up()
        migrationResult.statement = migration.schema.toStatement()
        await db.statement(migrationResult.statement)
        migrationResult.duration = Date.now() - timestamp
        migrationResult.status = 'success'
        migrationsRan.push(migration)
        finalResult.results.set(migration, migrationResult)
      } catch (error) {
        finalResult.error = error;
        migrationResult.error = `${migration.constructor.name} Migration Failed: ${error.message}`
        finalResult.culprit = migrationResult
        await this.rollbackBatch(migrationTimestamp,migrationTimestamp, migrationsRan, finalResult)
        break
      }
    }
    finalResult.duration = Date.now() - migrationTimestamp
    try {
      await this.saveResults(Array.from(finalResult.results.values()))
    } catch (error) {
      finalResult.message = 'Failed to save migration results.'
    }
    finalResult.result = !(finalResult.culprit || finalResult.error)
    return finalResult
  }

  private async rollbackBatch(batchId:number, migrationTimestamp:number,migrations:Migration[], finalResult:MigrationFinalResult ) {
    for (const migration of migrations) {
      migration.schema.reset()
      const connection = (migration as any).connection
      const db = await Elegant.singleton(connection)
      let result:MigrationResult = {
        status: 'error',
        action: 'rollback',
        batchId,
        timestamp: migrationTimestamp,
        duration: undefined,
        name: migration.constructor.name,
        error: undefined,
        created_at: undefined,
        statement: undefined,

      }
      try {
        let timestamp:any = Date.now()
        await migration.down()
        result.statement = migration.schema.toStatement()
        await db.statement(result.statement)
        result.status = 'success'
        result.duration = Date.now() - timestamp
      } catch (error) {
        result.error = error.toString()
      }
      finalResult.rollbackResults.set(migration, result)
    }
    return finalResult;
  }

  public async rollback():Promise<MigrationResult[]> {
    const results:MigrationResult[] = []
    const batchId:number = Date.now()
    const migrations =  await this.migrationFileMap( {order:'desc'})
      .then(migrations => {
        return migrations.map(m => m.migration)
          .filter(m => m.constructor.name !== 'CreateElegantMigrationTable')
      })
    const timestamp = Date.now()

    for (const migration of migrations) {
      const result = new MigrationResult({
        name: migration.constructor.name,
        batchId,
        action: 'rollback',
        status: 'success',
        error: undefined,
        timestamp,
        created_at: undefined,
        statement: undefined,
        duration: Date.now() - timestamp
      });
      if (!migration.shouldRun()) {
        result.status = 'skip'
        results.push(result)
        continue
      }
      try {
        await migration.down()
        result.duration = Date.now() - timestamp
        results.push(result)
      } catch (error) {
        result.status = 'error'
        result.error = error.message
        results.push(result);
      }
    }
    await this.saveResults(results)
    return results;
  }

  private async migrationFilter():Promise<(file:string) => boolean> {
    let filter
    try {
      const lastMigration:MigrationResult = await this.lastMigration()
      if (!lastMigration) return
      filter = (file => {
        const [,timestamp] = file.match(/(^\d+)\./)
        return timestamp > lastMigration.timestamp
      })
    } catch (error) {}
    return filter
  }

  /**
   * Retrieves the most recent successful migration from the database.
   *
   * @todo make query database agnostic
   * @return {Promise<any>} A promise resolving to the latest successful migration record, or undefined if no such record exists.
   */
  lastMigration():Promise<any> {
    return this.db.select('select * from elegant_migrations where status="success" order by created_at desc limit 1')
      .then(results => results[0])
  }

  /**
   * Saves the migration results into the database.
   *
   * @todo Make query database agnostic
   * @param {MigrationResult[]} results - An array of migration result objects to be saved to the database. Each object contains details about the migration such as name, batchId, action, statement, status, error, timestamp, and duration.
   * @return {Promise<void>} A promise that resolves once the migration results have been successfully stored in the database.
   */
  async saveResults(results:MigrationResult[]):Promise<void> {
    const db = await Elegant.singleton()
    const {database} = await this.getConnectionConfig()
    for (const result of results) {
      const {name, batchId, action, statement, status, error, timestamp, duration, created_at} = result
      const params = [name, batchId, action, statement, status, error, timestamp, duration]
      const query = `INSERT INTO ${database}.elegant_migrations (name, batchId, action, statement, status, error, timestamp, duration) VALUES (?, ?,?, ?, ?, ?, ?, ?)`
      await db.insert(query, params)
    }
  }

  protected async getConnectionConfig():Promise<ConnectionConfig> {
    const config = await getAppConfig()
    return config.connections[config.default]
  }
}
