import * as path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';
import {spawn} from 'node:child_process';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Constructs a base path based on the provided subPath.
 * If a subPath is provided, it appends the subPath to the base path.
 * If no subPath is given, it returns the base path.
 * @param {string} [subPath] - Optional sub-path to append to the base path.
 * @returns {string} The full base path, with or without the appended subPath.
 * */
export const basePath = (subPath?:string): string => {
  let basePath = path.resolve(__dirname, '..');
  return subPath ? path.join(basePath, subPath) : basePath;
}

export const runCommand = (command:string) => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      shell:true,
      stdio:'pipe'
    });
    child.stdout.on('data', data => console.log(data.toString()))
    child.stderr.on('data', data => console.log(data.toString()));
    child.on('error', error => reject(error))
    child.on('close', code => resolve(code));
  })
}
/**
 * Constructs a resource path based on the provided subPath.
 * If a subPath is provided, it appends the subPath to the base resources path.
 * If no subPath is given, it returns the base resources path.
 *
 * @param {string} [subPath] - Optional sub-path to append to the resources path.
 * @returns {string} The full resource path, with or without the appended subPath.
 **/
export const resourcePath = (subPath?:string):string =>
  subPath ? basePath(`resources/${subPath}`) : basePath(`resources`)

/**
 * Constructs an absolute path based on the current working directory.
 *
 * @param {string} [subPath] - An optional subpath to append to the current working directory.
 * @returns {string} The constructed path. If no subPath is provided, returns the current working directory.
 **/
export const appPath = (subPath?:string) => {
  const appPath = process.env.ELEGANT_BASE_PATH || process.cwd()
  return subPath ? path.join(appPath, subPath) : appPath
}

/**
 * Terminates the process with the specified exit code and optionally logs a message.
 *
 * @param {string} [msg] - Optional message to log before the process exits. Defaults to logging a message to the console.
 * Logs as an error if a non-zero exit code is provided.
 * @param {number} [code=0] - Exit code to terminate the process with. Defaults to 0 indicating a successful exit.
 **/
export const exit = (msg?:any, code:number=0) => {
  if (msg) {
    if (code) {
      console.error(msg)
    } else {
      console.log(msg)
    }
  }
  process.exit(code)
}

/**
 * Checks if the current application environment is using TypeScript.
 *
 * This function determines the presence of a TypeScript configuration file
 * (tsconfig.json) in the application directory to identify whether TypeScript is being used.
 *
 * @returns {boolean} True if a tsconfig.json file exists, indicating usage of TypeScript; otherwise, false.
 **/
export const isTypescript = ():boolean => {
  const tsconfigPath = appPath('tsconfig.json')
  return fs.existsSync(tsconfigPath)
}

/**
 * Retrieves the content of a template file based on the provided name.
 *
 * This function determines the appropriate template file to load based on
 * the existence of a TypeScript configuration file (tsconfig.json).
 * If the configuration file exists, a TypeScript template (.tpl.ts) is loaded;
 * otherwise, a JavaScript template (.tpl.js) is used.
 *
 * @param {string} name - The name of the template file without the file extension.
 * @returns {string} The content of the template file as a UTF-8 encoded string.
 * @throws {Error} If the specified template file does not exist or cannot be accessed.
 **/
export const getTemplate = (name:string) => {
  const tsconfigPath = appPath('tsconfig.json')
  if (fs.existsSync(tsconfigPath)) {
    return fs.readFileSync(basePath(`resources/templates/${name}.tpl.ts`), 'utf8')
  } else {
    return fs.readFileSync(basePath(`resources/templates/${name}.tpl.js`), 'utf8')
  }
}

export const log = (message:string, type:'success'|'error'|'warning' = 'success') => {
  const warning = chalk.hex('#FFA500');
  const error = chalk.bold.red;
  const success = chalk.bold.green;
  switch (type) {
    case 'success': console.log(success(message)); break;
    case 'error': console.error(error(message)); break;
    case 'warning': console.error(warning(message)); break;
  }
}
export const toSnakeCase = (str) => {
  return str
    .trim()
    // Insert underscore before uppercase letters (for camelCase/PascalCase)
    .replace(/([A-Z])/g, '_$1')
    // Replace spaces, hyphens, and multiple underscores with single underscore
    .replace(/[\s-]+/g, '_')
    // Remove any non-alphanumeric characters except underscores
    .replace(/[^\w_]/g, '')
    // Convert to lowercase
    .toLowerCase()
    // Remove leading/trailing underscores and collapse multiple underscores
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');
}
export const toCamelCase = (str) => {
  return str
    .trim()
    // Replace spaces, hyphens, underscores with a marker
    .replace(/[\s_-]+(.)/g, (_, char) => char.toUpperCase())
    // Handle PascalCase to camelCase (lowercase first letter)
    .replace(/^[A-Z]/, char => char.toLowerCase())
    // Remove any remaining non-alphanumeric characters
    .replace(/[^\w]/g, '');

}

export const lastChar = (str:string) => str[str.length - 1]

export const inferTableNameFromModelName = (name:string) => {
  let tableName = name.replace(/model/i,'')
  tableName = toSnakeCase(tableName)
  if (lastChar(tableName) == 'y') {
    tableName = tableName.slice(0, tableName.length -1 ) + 'ies'
  } else if (lastChar(tableName) !== 's') {
    tableName += 's'
  }
  return tableName
}

/**
 * Infers a table name from a given column name by applying specific naming conventions.
 *
 * The function expects the column name to follow the pattern `{table_name}_id`.
 * If the column name matches the pattern, it extracts the table name and modifies it
 * according to the following rules:
 * - If the table name ends with 'y', it replaces 'y' with 'ies' (e.g., 'category_id' becomes 'categories').
 * - If the table name does not end with 's', it appends an 's' to the name (e.g., 'user_id' becomes 'users').
 *
 * @param {string} name - The column name from which to infer the table name.
 * @returns {string|undefined} The inferred table name based on the column name. Returns `undefined` if the column name does not match the expected pattern.
 */
export const inferTableNameFromColumn = (name:string)=> {
  const pattern = /([\w_\-]+)_id$/
  const match = name.match(pattern)
  if ( !match ) return
  const [,tableName] = match;
  if (lastChar(tableName) === 'y') return `${tableName.slice(0, tableName.length -1)}ies`
  if (lastChar(tableName) != 's') return `${tableName}s`
}

export const getTsConfig = () => {
  const tsconfigPath = appPath('tsconfig.json')
  if (!fs.existsSync(tsconfigPath)) throw new Error(`TSconfig file missing in ${tsconfigPath}`)
  const jsonString = fs.readFileSync(tsconfigPath, 'utf8')
  return JSON.parse(jsonString)
}
