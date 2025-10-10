import {getAppConfig} from './config';
import {appPath} from './util';
import fs from 'node:fs';
import {basename} from 'node:path'
import Elegant, {Migration, Schema} from '../index';
import {ElegantConfig, MigrationFile, MigrationFileMap, MigrationStatus} from '../types';
import {pathToFileURL} from 'url';

export class MigrationManager {
  protected migrationPath:string;
  protected config:ElegantConfig;

  async init() {
    this.config = await getAppConfig()
    this.migrationPath = appPath(this.config.migrations.directory)
  }

  /**
   * Retrieves the  object for a given migration file path.
   * @param {string} migrationFilePath - The path of the migration file.
   * @return {MigrationFile} The migration file object.
   */
  protected migrationFilePathToMigrationFile(migrationFilePath:string):MigrationFile {
    const fileName = basename(migrationFilePath)
    const date = new Date(Number(fileName.split('.')[0]))
    const name = migrationFilePath
      .replace('.migration.js', '')
      .replace('.migration.ts', '')
      .replace(/^\d+\./, '')
    const path = `${this.migrationPath}/${migrationFilePath}`
    return { date, name, path, status:null }
  }
  /**
   * Retrieves the file path for a given MigrationFile.
   * @param {MigrationFile} migrationFile - The migration file for which to retrieve the path.
   * @return {string} The migration file path.
   */
  protected migrationFileToMigrationFilePath(migrationFile:MigrationFile):string {
    return `${migrationFile.date.getTime()}.${migrationFile.name}.migration.js`
  }
  /**
   * Retrieves the list of migration files in the migration directory.
   * @return {MigrationFile[]} An array of migration files.
   */
  protected getMigrationFiles(order:'asc'|'desc' = 'asc'):MigrationFile[] {
    const migrationFiles = fs.readdirSync(this.migrationPath)
      .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))
      .filter(file => file.match(/^\d+\./))
      .map(file => this.migrationFilePathToMigrationFile(file))
      .sort()
    return (order === 'desc') ? migrationFiles.reverse() : migrationFiles
  }

  /**
   * Retrieves the last ran migration file.
   * @return {MigrationFile} The last ran migration.
   */
  protected getLastRanMigration():MigrationFile {
    const state:string = this.getState()
    if (state) {
      return this.migrationFilePathToMigrationFile(state)
    } else {
      return null
    }
  }

  protected async getMigrations(order:'asc'|'desc' = 'asc'):Promise<MigrationFileMap[]> {
    const migrationFiles = this.getMigrationFiles(order)
    const migrations:MigrationFileMap[] = []
    for (const file of migrationFiles) {
      const fileUrl = pathToFileURL(file.path).href
      const {default:MigrationClass} = await import(fileUrl)
      const schema = new Schema(await Elegant.connection())
      const migration:Migration = new MigrationClass(schema)
      migrations.push({
        constructor:migration,
        file
      })
    }
    return migrations
  }

  getMigrationStatus(lastRanMigration:MigrationFile, migrationFile:MigrationFile, action:'migrate'|'rollback'='migrate'):MigrationStatus {
    switch (action) {
      case 'migrate':
        if (! lastRanMigration) return 'outstanding'
        return (migrationFile.date.getTime() <= lastRanMigration.date.getTime()) ?  'success' : 'outstanding'
      case "rollback":
        if (! lastRanMigration) return 'outstanding'
        return (migrationFile.date.getTime() >= lastRanMigration.date.getTime()) ? 'success' : 'outstanding'
    }
  }
  /**
   * Retrieves a migration file by its name.
   *
   * @param {string} name - The name of the migration file to retrieve.
   * @return {MigrationFile} The migration file with the specified name.
   */
  protected getMigrationFile(name:string):MigrationFile {
    return this.getMigrationFiles().find(file => file.name === name)
  }
  private getState():string {
    return fs.readFileSync(`${this.migrationPath}/.state`).toString()
  }
}
