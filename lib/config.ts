import {appPath, resourcePath} from './util';
import * as fs from 'node:fs';

export const getConfig = ():ElegantConfig => {
  const configPath = resourcePath('elegant.config.js')
  return require(configPath)
}

export const getAppConfig = ():ElegantConfig => {
  const configPath = appPath('elegant.config.js')
  if (! fs.existsSync(configPath)) throw new Error(`Elegant Configuration file not found at ${configPath}`)
  return require(configPath)
}

export const getConfigString = ():string => {
  const configPath = resourcePath('elegant.config.js')
  return fs.readFileSync(configPath, 'utf8')
}
