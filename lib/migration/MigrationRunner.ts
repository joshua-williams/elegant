import Elegant from '../../index.js';
import {MigrationManager} from './MigrationManager.js';
import MigrationResult from './MigrationResult.js';


export default class MigrationRunner extends MigrationManager {

  public async run():Promise<MigrationResult[]> {
    const results:MigrationResult[] = []
    const batchId:number = Date.now()
    const migrations =  await this.getMigrations()
      .then(migrations => migrations.map(m => m.migration))
    const timestamp = Date.now()

    for (const migration of migrations) {
      const result = new MigrationResult(
        migration.constructor.name,
        batchId,
        'migrate',
        'success',
        undefined,
        timestamp,
        Date.now() - timestamp
      );
      if (!migration.shouldRun()) {
        result.status = 'skip'
        results.push(result)
        continue
      }
      try {
        await migration.up()
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

  public async rollback():Promise<MigrationResult[]> {
    const results:MigrationResult[] = []
    const batchId:number = Date.now()
    const migrations =  await this.getMigrations('desc')
      .then(migrations => {
        return migrations.map(m => m.migration)
          .filter(m => m.constructor.name !== 'CreateElegantMigrationTable')
      })
    const timestamp = Date.now()

    for (const migration of migrations) {
      const result = new MigrationResult(
        migration.constructor.name,
        batchId,
        'rollback',
        'success',
        undefined,
        timestamp,
        Date.now() - timestamp
      );
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

  async saveResults(results:MigrationResult[]) {
    const db = await Elegant.connection()
    for (const result of results) {
      const {name, batchId, action, status, error, duration, created_at} = result
      const params = [name, batchId, action, status, error, duration, created_at]
      const query = `INSERT INTO elegant.elegant_migrations (name, batchId, action, status, error, duration, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
      await db.query(query, params)
    }
  }

}
