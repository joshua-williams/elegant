import * as path from 'node:path';
import fs from 'node:fs';

export const basePath = (subPath?:string) =>
  subPath ? path.join(path.dirname(__dirname), subPath) : path.dirname(__dirname)


export const resourcePath = (subPath?:string) =>
  subPath ? basePath(`resources/${subPath}`) : basePath(`resources`)


export const appPath = (subPath?:string) =>
  subPath ? path.join(process.cwd(), subPath) : process.cwd()

export const exit = (msg?:string, code:number=0) => {
  if (msg) {
    if (code) {
      console.error(msg)
    } else {
      console.log(msg)
    }
  }
  process.exit(code)
}

export const isTypescript = ():boolean => {
  const tsconfigPath = appPath('tsconfig.json')
  return fs.existsSync(tsconfigPath)
}
export const getTemplate = (name:string) => {
  const tsconfigPath = appPath('tsconfig.json')
  if (fs.existsSync(tsconfigPath)) {
    return fs.readFileSync(basePath(`resources/templates/${name}.tpl.ts`), 'utf8')
  } else {
    return fs.readFileSync(basePath(`resources/templates/${name}.tpl.js`), 'utf8')
  }
}

