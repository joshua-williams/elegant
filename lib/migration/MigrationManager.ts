import {appPath} from '../util.js';
import fs from 'node:fs';
import path, {basename} from 'node:path'
import Elegant, {Migration, Schema} from '../../index.js';
import {ElegantConfig, MigrationFile} from '../../types.js';
import MigrationResult from './MigrationResult.js';

type MigrationFileMapOptions = {
  filter?:(file:string)=>boolean
  order?:'asc'|'desc'
}
export class MigrationManager {
  constructor(
    protected db:Elegant,
    protected config:ElegantConfig) {}

  /**
   * Constructs and returns the migration path based on the provided subPath.
   *
   * @param {string} [subPath] - Optional subdirectory or file path to append to the base migrations' directory.
   * @return {string} The complete path to the migrations directory or the optional subPath appending it.
   */
  migrationPath(subPath?:string):string {
    return subPath ? path.join(appPath(this.config.migrations.directory), subPath) : appPath(this.config.migrations.directory)
  }

  /**
   * Retrieves the object for a given migration file path.
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
   * Retrieves and sorts migration files from the directory based on the given filter and order.
   *
   * @param {function(string): boolean | 'asc' | 'desc'} [filter] - A function to filter migration files or shorthand for specifying sorting order ('asc' or 'desc').
   * @param {'asc' | 'desc'} [order='asc'] - Determines the sorting order of the migration files. Defaults to 'asc' if not specified.
   * @return {string[]} An array of sorted migration file names based on the specified filter and order.
   */
  protected migrationFiles(filter?:(file:string)=>boolean|'asc'|'desc', order:'asc'|'desc' = 'asc'):MigrationFile[] {
    let migrationFiles:string[] = fs.readdirSync(this.migrationPath())
      .filter(file => file.endsWith('.migration.js') || file.endsWith('.migration.ts'))
      .filter(file => file.match(/^\d+\./))
    if (typeof filter === 'function') migrationFiles = migrationFiles.filter(filter)
    migrationFiles = order === 'asc' ? migrationFiles.sort() : migrationFiles.reverse()
    return migrationFiles.map(file => this.pathToMigrationFile(file))
  }

  getMigrations() {
    return this.db.select('select * from elegant_migrations order by created_at desc') as Promise<MigrationResult[]>
  }

  async migrationFileMap(options:MigrationFileMapOptions) {
    let {filter, order} = options
    if (!order) order = 'asc'
    const map: {migration:Migration, file:MigrationFile}[] = []
    let migrationFiles = (typeof filter === 'function') ? this.migrationFiles(filter, order) : this.migrationFiles()
    for (const migrationFile of migrationFiles) {
      let MigrationConstructor:any = await import(migrationFile.path)
      if (!MigrationConstructor.default) {
        throw new Error(`Migration file ${migrationFile} does not export a default class`)
      }
      MigrationConstructor = MigrationConstructor.default
      const db = await Elegant.singleton()
      const schema = new Schema(db)
      const migration = new MigrationConstructor(schema) as Migration;
      map.push({migration, file: migrationFile})
    }
    return map
  }
}
