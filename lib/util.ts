import * as path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'url';

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
  let basePath = path.resolve(__dirname, '../../');
  return subPath ? path.join(basePath, subPath) : basePath;
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
