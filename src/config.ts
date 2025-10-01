import {resourcePath} from '../lib/util';
import * as fs from 'node:fs';

export const getConfig = ():ElegantConfig => {
  const configPath = resourcePath('elegant.config.js')
  return require(configPath)
}

export const getConfigString = ():string => {
  const configPath = resourcePath('elegant.config.js')
  return fs.readFileSync(configPath, 'utf8')
}
