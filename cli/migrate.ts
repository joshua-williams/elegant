import {Command} from 'commander'
import MigrationRunner from '../lib/MigrationRunner';

const runner = new MigrationRunner();

export const MigrateCommand = new Command('migrate')
  .description('Database migrations')
  .action(async () => {
    await runner.run('up')
    console.log('Database migration completed')
  })

export const RollbackCommand = new Command('migrate:rollback')
  .description('Rollback database migrations')
  .action(async () => {
    runner.run('down')
      .then(results => {
        console.log(JSON.stringify(results, null, 2))
      })
  })

