import { pathToFileURL } from 'url';
import {appPath, resourcePath} from './util.js';
import * as fs from 'node:fs';
import {ElegantConfig} from '../types.js';

export const getConfig = async ():Promise<ElegantConfig> => {
  const configPath = resourcePath('elegant.config.js')
  return await import(configPath).then(module => module.default)
}

export const getAppConfig = async ():Promise<ElegantConfig> => {
  let configPath = appPath('elegant.config.js')
  if (! fs.existsSync(configPath)) throw new Error(`Elegant Configuration file not found at ${configPath}`)
  let {default:config} = await import(pathToFileURL(configPath).href)
  return config
}

export const getConfigString = ():string => {
  const configPath = resourcePath('elegant.config.js')
  return fs.readFileSync(configPath, 'utf8')
}
