import AsciiTable from 'ascii-table'
import {Command} from 'commander'
import MigrationRunner from '../lib/migration/MigrationRunner.js';
import MigrationInspector from '../lib/migration/MigrationInspector.js';
import {log} from '../lib/util.js';
import Elegant from '../src/Elegant.js';
import {getAppConfig} from '../lib/config.js';

export const MigrateCommand = new Command('migrate')
  .description('Database migrations')
  .option('-d, --debug', 'Show debug message info')
  .action(async (options) => {
    const db = await Elegant.singleton()
    const config = await getAppConfig()
    const runner = new MigrationRunner(db, config);
    try {
      const result = await runner.run()
      if (options.debug) console.log(result)
      if (result.error) {
        log(`${result.culprit.name} Migration failed: ${result.error.message}`, 'error')
      } else {
        log(`Migration completed`, 'success')
      }

    } catch(err) {
      console.error(err.message)
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
