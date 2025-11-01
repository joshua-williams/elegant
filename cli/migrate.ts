import AsciiTable from 'ascii-table'
import {Command} from 'commander'
import MigrationRunner from '../lib/migration/MigrationRunner.js';
import MigrationInspector from '../lib/migration/MigrationInspector.js';
import {log} from '../lib/util.js';
import Elegant from '../src/Elegant.js';
import {getAppConfig} from '../lib/config.js';
import chalk from 'chalk';

export const MigrateCommand = new Command('migrate')
  .description('Database migrations')
  .option('-d, --debug', 'Show debug message info')
  .option('-v, --verbose log level', 'Verbose log level')
  .action(async (options) => {
    const db = await Elegant.singleton()
    const config = await getAppConfig()
    const runner = new MigrationRunner(db, config);
    try {
      const result = await runner.run()
      if (options.debug) console.log(result)
      ////////////// Summary Report /////////////////////
      let stdout = 'Status: ' + ((result.result) ? chalk.green('Success') : chalk.red('Failed'))
      stdout += `\nDuration: ${result.duration}ms`
      if (!result.result) {
        if (result.culprit) stdout += `\nError: ${chalk.red(result.culprit.error)}}`
        if (options.verbose) stdout += `\nStatement: ${result.culprit.statement}`
      }
      const rollback = result.rollbackResults.size ? 'Yes' : 'No'
      const rollbackErrorResult = result.rollbackResults.values().find(result => result.error)
      if (options.verbose && rollbackErrorResult) {
        stdout += `\nRollback: ${rollback}`
        stdout += `\nRollback Error: ${chalk.red(rollbackErrorResult.error)}`
      }
      console.log(stdout)

      if (result.result) {
        const table = new AsciiTable('Migration Results')
          .setHeading('Migration', 'Status', 'Duration')
        result.results.forEach(m => {
          table.addRow( m.name, m.status, m.duration+'ms')
        })
        console.log(table.toString())
      }

      ////////////////// MIGRATION REPORT /////////////////
      if (result.rollbackResults.size) {
        const table = new AsciiTable('Migration Rollback Status')
          .setHeading('Migration', 'Status', 'Message')
        result.rollbackResults.values().forEach(m => {

          table.addRow(m.name, m.status, m.error)
        })
        console.log(table.toString())
      }
    } catch(err) {
      if (options.debug) console.error(err.message)
    } finally {
      await Elegant.disconnect()
    }
  })

export const RollbackCommand = new Command('migrate:rollback')
  .description('Rollback database migrations')
  .action(async () => {
    const db = await Elegant.singleton()
    const config = await getAppConfig()
    const runner = new MigrationRunner(db, config);
    try {
      await runner.rollback()
    } catch(err) {
      console.error(`Failed to run migration rollback command: ${err.message}`)
    } finally {
      await Elegant.disconnect()
    }
  })

export const StatusCommand = new Command('migrate:status')
  .description('List all migrations that have been run')
  .option('-d, --debug', 'Show debug message info')
  .action(async (opt) => {
    const db = await Elegant.singleton()
    const config = await getAppConfig()
    const inspector = new MigrationInspector(db, config);
    let status
    try {
      status = await inspector.getStatus()
    } catch(err) {
      log(`Failed to inspect status message info`, "error")
      if (opt.debug) console.log(err)
      await Elegant.disconnect()
      process.exit(1)
    }
    await Elegant.disconnect()
    const table = new AsciiTable('Migration Status')
      .setHeading('Migration Date', 'Class Name', 'Status')
    status.forEach(m => {

      table.addRow(m.date, m.name, m.status)
    })
    console.log(table.toString())
  })
