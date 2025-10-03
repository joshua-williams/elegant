import {Command} from 'commander'
import migrate from '../lib/migrate';

export default new Command('migrate')
  .description('Database migrations')
  .action(async (options) => {
    console.log('Migrating database...')
    await migrate()
  })
