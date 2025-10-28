import Elegant, {Migration} from '../../index.js';
import {MigrationManager} from './MigrationManager.js';
import MigrationResult from './MigrationResult.js';
import { ConnectionConfig} from '../../types.js';
import {getAppConfig} from '../config.js';

type MigrationFinalResult = {
  result: boolean,
  error: Error,
  message: string,
  culprit:MigrationResult,
  statement: string
  results: Map<Migration, MigrationResult>
  rollbackResults: Map<Migration, MigrationResult>
}

export default class MigrationRunner extends MigrationManager {

  public async run():Promise<MigrationFinalResult> {
    const finalResult:MigrationFinalResult = {
      result: false,
      error: undefined,
      message: '',
      culprit: undefined,
      statement: '',
      results: new Map(),
      rollbackResults: new Map()
    }
    const timestamp:number = Date.now()
    const filter = await this.migrationFilter()
    const migrationFileMaps = (await this.migrationFileMap({filter}))
    const migrationsRan:Migration[] = []

    for (const migrationFileMap of migrationFileMaps) {
      const {migration, file} = migrationFileMap

      migration.schema.$.autoExecute = true

      const migrationTimestamp = file.date.getTime()
      const migrationResult:MigrationResult = new MigrationResult({
        name: migration.constructor.name,
        batchId: timestamp,
        action: 'migrate',
        status: 'error',
        timestamp: migrationTimestamp,
        error: undefined,
        statement: undefined,
        created_at: undefined,
        duration: Date.now() - timestamp
      });

      if (!migration.shouldRun()) {
        migrationResult.status = 'skip'
        finalResult.results.set(migration, migrationResult)
        continue
      }
      // run migration.up
      try {
        await migration.up()
        migrationsRan.push(migration)
      } catch (error) {
        let statement:string = ''
        for (const table in migration.schema.tables) {
          statement += migration.schema.tables[table].toStatement() + '\n\n'
        }
        finalResult.error = error
        finalResult.culprit = migrationResult
        finalResult.statement = statement
        break
      }
      // resolve promises made by having schema.$.autoExecute enabled
      try {
        await Promise.all(migration.schema.$.executePromises)
      } catch (error) {
        finalResult.error = error
        finalResult.culprit = migrationResult
        break
      }

      migrationResult.status = 'success'

      let statement = ''
      for (const table in migration.schema.tables) {
        statement += migration.schema.tables[table].toStatement() + '\n\n'
      }
      migrationResult.statement = statement
      migrationResult.duration = Date.now() - timestamp
      finalResult.results.set(migration, migrationResult)
    }

    // Rollback migrations that were run if an error occurred
    if (finalResult.error) {

      for (const migration of migrationsRan) {
        let timestamp:number = Date.now()
        let batchId:number = Date.now()
        let migrationResult:MigrationResult = {
          status: undefined,
          action: 'rollback',
          batchId,
          timestamp,
          duration: undefined,
          name: migration.constructor.name,
          error: undefined,
          created_at: undefined,
          statement: undefined,

        }
        try {
          await migration.down()
          migrationResult.status = 'success'
          migrationResult.duration = Date.now() - timestamp
          finalResult.rollbackResults.set(migration, migrationResult)
        } catch (error) {
          migrationResult.status = 'error'
          migrationResult.error = error
          finalResult.rollbackResults.set(migration, migrationResult)
        }
      }
      const hasElegantMigration = finalResult.results.values()
        .find(result => result.name === 'CreateElegantMigrationTable')
      if (!hasElegantMigration) await this.saveResults([finalResult.culprit])
      return finalResult
    }

    const results = Array.from(finalResult.results.values())
    await this.saveResults(results)
    return finalResult
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
