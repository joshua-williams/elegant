import {MigrationManager} from './MigrationManager.js';
import MigrationResult from './MigrationResult.js';

export default class MigrationInspector extends MigrationManager {

  async getStatus() {

    const migrations:any[] = (await this.getMigrations())
      .map( (migration:MigrationResult) => {
        return {
          date: migration.created_at,
          name: migration.name,
          status: migration.status,
        }
      })
    const pending = this.migrationFiles()
      .filter(m => !m.name.includes('CreateElegantMigrationTable'))
      .filter(m1 => !migrations.find(m2 => m1.name === m2.name))
      .map(m => ({...m, status: 'pending', name: m.name.replace('.migration.', '')}))

    return [...pending, ...migrations]

  }
}
