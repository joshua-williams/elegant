import Elegant from '../../index.js';
import {MigrationManager} from './MigrationManager.js';
import MigrationResult from './MigrationResult.js';
import { ConnectionConfig} from '../../types.js';
import {getAppConfig} from '../config.js';


export default class MigrationRunner extends MigrationManager {

  public async run():Promise<MigrationResult[]> {
    const results:MigrationResult[] = []
    const batchId:number = Date.now()
    let filter
    try {
      const lastMigration = await this.lastMigration()
      if (lastMigration.length) {
        filter = (f) => f > lastMigration.timestamp
      }
    } catch (error) {}
    const migrations =  await this.getMigrationFileMap(filter, 'asc')
      .then(migrations => migrations.map(m => m.migration))
    const timestamp = Date.now()
    for (const migration of migrations) {
      const result:MigrationResult = new MigrationResult({
        name: migration.constructor.name,
        batchId,
        action: 'migrate',
        status: 'success',
        error: undefined,
        timestamp,
        statement: undefined,
        created_at: undefined,
        duration: Date.now() - timestamp
      });
      if (!migration.shouldRun()) {
        result.status = 'skip'
        results.push(result)
        continue
      }
      try {
        await migration.up()
        let statement = ''
        for (const table in migration.schema.tables) {
          statement += await migration.schema.tables[table].toStatement()
        }
        result.statement = statement
        result.duration = Date.now() - timestamp
        results.push(result)
      } catch (error) {
        result.status = 'error'
        result.error = error.message
        let statement:string = ''
        for (const table in migration.schema.tables) {
          statement += await migration.schema.tables[table].toStatement() + '\n\n'
        }
        result.statement = statement
        results.push(result);
      }
    }
    await this.saveResults(results)
    return results;
  }

  public async rollback():Promise<MigrationResult[]> {
    const results:MigrationResult[] = []
    const batchId:number = Date.now()
    const migrations =  await this.getMigrationFileMap(undefined, 'desc')
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

  lastMigration():Promise<any> {
    return this.db.select('select * from elegant_migrations order by created_at desc limit 1')
  }

  async saveResults(results:MigrationResult[]) {
    const db = await Elegant.singleton()
    const {database} = await this.getConnectionConfig()
    for (const result of results) {
      const {name, batchId, action, status, error, duration, created_at} = result
      const params = [name, batchId, action, status, error, duration]
      const query = `INSERT INTO ${database}.elegant_migrations (name, batchId, action, status, error, duration) VALUES (?, ?, ?, ?, ?, ?)`
      const affected = await db.insert(query, params)
      console.log('rows affected', affected)
    }
  }
  protected async getConnectionConfig():Promise<ConnectionConfig> {
    const config = await getAppConfig()
    return config.connections[config.default]
  }
}
