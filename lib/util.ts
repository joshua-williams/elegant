import * as path from 'node:path';

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
