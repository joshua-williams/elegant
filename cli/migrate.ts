import {Command} from 'commander'

export default new Command('migrate')
  .description('Database migrations')
  .action(async (options) => {
  })
