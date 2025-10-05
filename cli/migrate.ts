import {Command} from 'commander'
import MigrationRunner from '../lib/MigrationRunner';

const runner = new MigrationRunner();

export const MigrateCommand = new Command('migrate')
  .description('Database migrations')
  .action(async (options) => {
    await runner.run('up')
    console.log('Database migration completed')
  })

export const RollbackCommand = new Command('migrate:rollback')
  .description('Rollback database migrations')
  .action(async (options) => {
    await runner.run('down')
    console.log('Database rollback completed')
  })

