import {Command} from 'commander'
import migrate from '../lib/migration';

export const MigrateCommand = new Command('migrate')
  .description('Database migrations')
  .action(async (options) => {
    console.log('Migrating database...')
    await migrate()
  })

export const RollbackCommand = new Command('migrate:rollback')
  .description('Rollback database migrations')
  .action(async (options) => {
    console.log('Rolling back database migration...')
    await migrate()
  })

