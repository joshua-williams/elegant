import {BaseMigration} from './BaseMigration';
import {MigrationFile} from '../types';

export default class MigrationInspector extends BaseMigration {

  async getRanMigrations():Promise<MigrationFile[]> {
    const lastMigrationFile = this.getLastRanMigration()
    const migrationFileMaps =  await this.getMigrations()
    return migrationFileMaps
      .map((map) => {
        const migrationFile = map.file
        if (!map.constructor.shouldRun()) {
          migrationFile.status = 'skip'
          return migrationFile
        }
        migrationFile.status = this.getMigrationStatus(lastMigrationFile, migrationFile)
        if (lastMigrationFile) {
          if (migrationFile.date.getTime() <= lastMigrationFile.date.getTime()) {
            migrationFile.status = 'success'
          } else if (migrationFile.date.getTime() > lastMigrationFile.date.getTime()) {
            migrationFile.status = 'outstanding'
          }
        } else {
          migrationFile.status = 'outstanding'
        }

        return migrationFile
      })
  }

}
