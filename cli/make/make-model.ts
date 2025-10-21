import {Command} from 'commander'
import {appPath, getTemplate, isTypescript, log} from '../../lib/util.js';
import * as fs from 'node:fs';
import {getAppConfig} from '../../lib/config.js';
import path from 'node:path';
import Elegant from '../../src/Elegant.js';
import TypeGenerator from '../../lib/use-case/TypeGenerator.js';

export default new Command('make:model')
  .description('create database model')
  .argument('<name>', 'model name')
  .action(async (name: string, options) => {
    const config = await getAppConfig()
    const modelDir = appPath(config.models.directory)
    const targetName = `${name}Model` + (isTypescript() ? '.ts' : '.js')
    const modelPath = path.resolve(modelDir, targetName)
    if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, {recursive: true})
    const template = getTemplate('model').replace('ModelClass', name)
    fs.writeFileSync(modelPath, template)
    log(`ModelClass ${name} created`)
      const db = await Elegant.singleton()
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


