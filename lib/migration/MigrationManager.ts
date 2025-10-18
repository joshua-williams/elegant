import {getAppConfig} from '../config.js';
import {appPath} from '../util.js';
import fs from 'node:fs';
import path, {basename} from 'node:path'
import Elegant, {Migration, Schema} from '../../index.js';
import {ElegantConfig, MigrationFile, MigrationFileMap, MigrationStatus} from '../../types.js';
import {pathToFileURL} from 'url';
import chalk from 'chalk';

export class MigrationManager {
  protected config:ElegantConfig;

  async init() {
    this.config = await getAppConfig()
  }

  /**
   * Constructs and returns the migration path based on the provided subPath.
   *
   * @param {string} [subPath] - Optional subdirectory or file path to append to the base migrations directory.
   * @return {string} The complete path to the migrations directory or the optional subPath appending it.
   */
  migrationPath(subPath?:string):string {
    return subPath ? path.join(appPath(this.config.migrations.directory), subPath) : appPath(this.config.migrations.directory)
  }

  /**
   * Retrieves the  object for a given migration file path.
   * @param {string} migrationFilePath - The path of the migration file.
   * @return {MigrationFile} The migration file object.
   */
  protected pathToMigrationFile(migrationFilePath:string):MigrationFile {
    const fileName = basename(migrationFilePath)
    const date = new Date(Number(fileName.split('.')[0]))
    const name = migrationFilePath
      .replace(/.migration.js|ts$/, '')
      .replace(/^\d+\./, '')
    const path = this.migrationPath(migrationFilePath)//`${this.migrationPath}/${migrationFilePath}`
    return { date, name, path, status:null }
  }

  /**
   * Retrieves the list of migration files in the migration directory.
   * @return {MigrationFile[]} An array of migration files.
   */
  protected getMigrationFiles(order:'asc'|'desc' = 'asc'):MigrationFile[] {
    const migrationFiles = fs.readdirSync(this.migrationPath())
      .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))
      .filter(file => file.match(/^\d+\./))
      .map(file => this.pathToMigrationFile(file))
      .sort()
    return (order === 'desc') ? migrationFiles.reverse() : migrationFiles
  }

  protected async getMigrations(order:'asc'|'desc' = 'asc'):Promise<MigrationFileMap[]> {
    const config = await getAppConfig()
    const migrationFiles = this.getMigrationFiles(order)
    const migrations:MigrationFileMap[] = []
    for (const file of migrationFiles) {
      const fileUrl = pathToFileURL(file.path).href
      const {default:MigrationClass} = await import(fileUrl)
      const migration:Migration = new MigrationClass()
      const connectionName = (migration as any).connection || config.default

      let connection;
      try {
        connection = await Elegant.connection(connectionName)
      } catch(err) {
        err.message += chalk.red(`Migration error while connecting to ${chalk.bold(connectionName)}\n`)
        err.message += `Update database credentials in ${chalk.bold('elegant.config.js')}`
        throw err;
      }
      migration.schema = new Schema(connection)
      migrations.push({
        migration,
        file
      })
    }
    return migrations
  }
}
