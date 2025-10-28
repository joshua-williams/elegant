import {MigrationManager} from './MigrationManager.js';
import MigrationResult from './MigrationResult.js';

export default class MigrationInspector extends MigrationManager {

  async getStatus() {
    let migrationResults = (await this.getMigrations() as any)
      .map( (migration:MigrationResult) => {
        return {
          date: new Date(migration.created_at).toISOString(),
          name: migration.name,
          status: migration.status,
        }
      })
    const pending = this.migrationFiles()
      .filter(m => !m.name.includes('CreateElegantMigrationTable'))
      .filter(m1 => !migrationResults.find(m2 => m1.name === m2.name))
      .map(m => ({...m, date: '', status: 'pending', name: m.name.replace('.migration.', '')}))

    return [...pending, ...migrationResults]

  }
}
