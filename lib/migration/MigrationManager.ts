import {getAppConfig} from '../config.js';
import {appPath} from '../util.js';
import fs from 'node:fs';
import path, {basename} from 'node:path'
import Elegant, {Migration, Schema} from '../../index.js';
import {ElegantConfig, MigrationFile, MigrationFileMap, MigrationStatus} from '../../types.js';
import {pathToFileURL} from 'url';
import chalk from 'chalk';

export class MigrationManager {
  constructor(
    protected db:Elegant,
    protected config:ElegantConfig) {}

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
   * Retrieves and sorts migration files from the specified migration path.
   *
   * @param {'asc'|'desc'} [order='asc'] - The order in which to sort the migration files.
   *                                       Use 'asc' for ascending order or 'desc' for descending order.
   * @return {MigrationFile[]} Array of migration files sorted in the specified order.
   */
  protected getMigrationFiles(order:'asc'|'desc' = 'asc', filter?:(file:string)=>boolean):MigrationFile[] {
    let migrationFiles:any = fs.readdirSync(this.migrationPath())
      .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))
      .filter(file => file.match(/^\d+\./))
    if (filter) {
      migrationFiles = migrationFiles.filter(filter)
    }
    migrationFiles = migrationFiles
      .map(file => this.pathToMigrationFile(file))
      .sort()
    return (order === 'desc') ? migrationFiles.reverse() : migrationFiles
  }

  getMigrations() {
    return this.db.select('select * from elegant_migrations order by created_at desc')
  }
  /**
   * Retrieves a list of migration files and their corresponding migration classes,
   * instantiates each migration, and attaches a database schema instance for processing.
   *
   * @param {'asc'|'desc'} [order='asc'] - The order in which migration files should be retrieved. Use 'asc' for ascending or 'desc' for descending order.
   * @return {Promise<MigrationFileMap[]>} A promise that resolves to an array of migration file mappings, each including the migration instance and file information.
   */
  protected async getMigrationFileMap(order:'asc'|'desc' = 'asc', filter?:(file:string)=>boolean):Promise<MigrationFileMap[]> {
    const migrationFiles = this.getMigrationFiles(order,filter)
    const migrations:MigrationFileMap[] = []
    for (const file of migrationFiles) {
      const fileUrl = pathToFileURL(file.path).href
      const {default:MigrationClass} = await import(fileUrl)
      const migration:Migration = new MigrationClass()
      const connectionName = (migration as any).connection || this.config.default

      let connection;
      try {
        connection = await Elegant.singleton(connectionName)
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
