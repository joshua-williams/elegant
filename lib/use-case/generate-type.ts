import {getAppConfig} from '../config.js';
import Elegant, {Model} from '../../index.js';
import {appPath, getTsConfig, inferTableNameFromModelName, isTypescript, log} from '../util.js';
import path, {basename} from 'node:path';
import fs from 'node:fs';
import ColumnDefinition from '../schema/ColumnDefinition.js';
import {
  BooleanColumnDefinition,
  JsonColumnDefinition,
  NumberColumnDefinition,
  TimestampColumnDefinition
} from '../schema/ColumnDefinitions.js';
import MysqlTable from '../schema/MysqlTable.js';
import MariaDBTable from '../schema/MariaDBTable.js';
import PostgresTable from '../schema/PostgresTable.js';
import SqliteTable from '../schema/SqliteTable.js';
import {ElegantConfig} from '../../types.js';

export const generateType = async (name:string, shouldUpdateTsConfig:boolean|'prompt' = false):Promise<any> => {
  const response = {
    result: false,
    message: '',
    error: '',
    warning: ''
  }
  const config = await getAppConfig()
  let model:Model;
  try {
    model = await getModel(name, config)
  } catch (error) {
    response.error = error.message
    return response
  }
  let content:string;
  try {
    content = await generateTypeString(model, config)
  } catch (error) {
    response.error = error.message
    return response
  }
  const fileName = model.constructor.name.replace(/model$/i, '')
  const extension = isTypescript() ? 'ts' : 'js'
  const typePath = path.join(appPath(config.models.directory), `${fileName}.d.${extension}`)
  try {
    fs.writeFileSync(typePath, content, 'utf8')
    response.result = true
    response.message = `Type file successfully generated ${basename(typePath)}`
  } catch (error) {
    response.error = error.message
    return response
  }
  try {
    const response = await updateTsConfig(config, shouldUpdateTsConfig)
    if (response.message) console.log(response.message)
    if (response.warning) log(response.warning, 'warning')
  } catch (error) {
    response.warning = `Update your tsconfig.json  include:["${config.models.directory}/*.d.ts]`
  }
  await model.disconnect()
  return response
}
const updateTsConfig = async (config, updateTsConfig:boolean|'prompt') => {
  if (!updateTsConfig) return
  const response = {
    result: false,
    message: '',
    error: '',
    warning: ''
  }
  let tsconfig
  try {
    tsconfig = getTsConfig()
  } catch (error) {
    response.warning = 'There is a syntax error with your tsconfig.json file',
    response.message = `Update tsconfig.json:\n{\n  include: ["${config.models.directory}/*.d.ts"]\n}`
    return response
  }
  if (tsconfig && !tsconfig?.include?.includes(`${config.models.directory}/*.d.ts`)) {
    const question = {
      type: 'list',
      name: 'updateTsConfig',
      message: 'Do you want to update tsconfig to include model types?',
      choices: ['yes', 'no'],
      default: 'yes',
    }
    //@ts-ignore
    return inquirer.prompt(question)
      .then(({updateTsConfig}) => {
        if (updateTsConfig === 'yes') {
          if (!tsconfig.hasOwnProperty('include')) tsconfig.include = []
          tsconfig.include.push(`${config.models.directory}/*.d.ts`)
          const tsconfigPath = appPath('tsconfig.json')
          fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2))
        }
      }).catch(() => {
        response.message = `Update tsconfig.json:\n{\n  include: ["${config.models.directory}/*.d.ts"]\n}`
        return response
      })
  }
}
const generateTypeString = async (model:Model, config:ElegantConfig):Promise<string> => {
  const columns:ColumnDefinition[] = await getDatabaseColumns(model, config)
  let content = `type ${model.constructor.name.replace(/model$/i,'')} = {\n`
  columns.forEach((column)=>{
    if (column instanceof BooleanColumnDefinition) {
      content += `  ${column.name}: boolean`;
    } else if ( column instanceof NumberColumnDefinition) {
      content += `  ${column.name}: number`;
    } else if ( column instanceof JsonColumnDefinition) {
      content += `  ${column.name}: Record<string, any>`;
    } else if ( column instanceof TimestampColumnDefinition) {
      content += `  ${column.name}: Date`;
    } else {
      content += `  ${column.name}: string;`
    }
    content += '\n'
  })
  content += '}'
  return content
}
const getDatabaseColumns = async (model:Model, config) => {
  const connection = (model as any).connection || config.default
  const db = await Elegant.connection(connection)
  const {dialect} = config.connections[connection]
  let Table:typeof MysqlTable| typeof MariaDBTable| typeof PostgresTable| typeof SqliteTable;
  switch (dialect) {
    case 'mysql':  Table = MysqlTable; break;
    case 'mariadb': Table = MariaDBTable; break;
    case 'postgres': Table = PostgresTable; break;
    case 'sqlite': Table = SqliteTable; break;
  }
  const tableName = inferTableNameFromModelName(model.constructor.name)
  const table:any = new Table(tableName, 'create', db)
  const columns = await table.getDatabaseColumns()
  await db.disconnect()
  return columns
}
const getModel = async (name:string, config:ElegantConfig):Promise<Model> => {
  const modelDir = appPath(config.models.directory)
  const modelFileName = fs.readdirSync(modelDir)
    .find( (file) => {
      const expected = `${name}Model.${isTypescript() ? 'ts' : 'js'}`.toLowerCase()
      if (file.toLowerCase().endsWith(expected)) {
        return true
      }
    })
  if (!modelFileName) {
    throw new Error(`Model ${name} not found`)
  }
  const modelPath = path.resolve(appPath(config.models.directory), modelFileName)
  const ModelClass:typeof Model = (await import(modelPath)).default
  return new ModelClass();
}
