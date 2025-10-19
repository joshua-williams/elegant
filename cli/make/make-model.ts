import {Command} from 'commander'
import {appPath, getTemplate, isTypescript} from '../../lib/util.js';
import * as fs from 'node:fs';
import {getAppConfig} from '../../lib/config.js';
import path from 'node:path';

export default new Command('make:model')
  .description('create database model')
  .argument('<name>', 'model name')
  .action(async (name: string, options) => {
    const config = await getAppConfig()
    const modelDir = appPath(config.models.directory)
    const targetName = `${name}Model` + (isTypescript() ? '.ts' : '.js')
    const modelPath = path.resolve(modelDir, targetName)
    if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir, {recursive: true})
    const template = getTemplate('model')
      .replace('ModelClass', name)
    fs.writeFileSync(modelPath, template)
  })


