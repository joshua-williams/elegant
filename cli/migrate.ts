import AsciiTable from 'ascii-table'
import {Command} from 'commander'
import MigrationRunner from '../lib/migration/MigrationRunner.js';
import MigrationInspector from '../lib/migration/MigrationInspector.js';

const runner = new MigrationRunner();
const inspector = new MigrationInspector();

export const MigrateCommand = new Command('migrate')
  .description('Database migrations')
  .action(async () => {
    try {
      await runner.init()
      await runner.run()
    } catch(err) {
      console.error(`Failed to run migration run command: ${err.message}`)
    }
    console.log('Database migration completed')
  })

export const RollbackCommand = new Command('migrate:rollback')
  .description('Rollback database migrations')
  .action(async () => {
    try {
      await runner.init()
      await runner.rollback()
    } catch(err) {
      console.error(`Failed to run migration rollback command: ${err.message}`)
    }
  })

export const StatusCommand = new Command('migrate:status')
  .description('List all migrations that have been run')
  .action(async () => {
    await inspector.init()
    const table = new AsciiTable('Migration Status')
      .setHeading('Date Created', 'Class Name', 'Status')

    // const files = await inspector.getRanMigrations()
    // files.forEach(file => {
    //   const date = new Date(file.date)
    //   const status = file.status
    //   const name = file.name
    //   const dateTime = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    //   table.addRow(dateTime, name, status)
    // })
    // console.log(table.toString())
  })
