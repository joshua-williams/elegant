import {Command} from 'commander'
import { log } from '../../lib/util.js';
import {generateType} from '../../lib/use-case/generate-type.js';

export default new Command('make:types')
  .description('generate database model types')
  .argument('<name>', 'model name')
  .action(async (name: string) => {
    const {result, message, error, warning} = await generateType(name)
    if (result) log(error, 'error')
    else if (message) log(message)
    if (warning) log(warning, 'warning')
  })
