import {Command} from 'commander'

export default new Command('make:migration')
  .description('create database migrations')
  .argument('<name>', 'migration name')
  .action(async (name:string, options) => {

  })


