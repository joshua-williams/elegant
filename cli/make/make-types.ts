import {Command} from 'commander'
import { log } from '../../lib/util.js';
import Elegant from '../../src/Elegant.js';
import {getAppConfig} from '../../lib/config.js';
import TypeGenerator from '../../lib/use-case/TypeGenerator.js'

export default new Command('make:type')
  .description('generate database model types')
  .argument('<name>', 'model name')
  .action(async (name: string) => {
    const db = await Elegant.singleton()
    const config = await getAppConfig()
    const generator = new TypeGenerator(db, config)
    try {
      const {result, message, error, warning} = await generator.generate(name);
      if (result) log(error, 'error')
      else if (message) log(message)
      if (warning) log(warning, 'warning')
    } catch (error) {
      console.error(error.message)
      process.exit(1)
    } finally {
      await Elegant.disconnect()
    }
  })
