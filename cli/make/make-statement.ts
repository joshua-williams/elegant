import {Command} from 'commander';
import Elegant from '../../src/Elegant.js';
import {MigrationManager} from '../../lib/migration/MigrationManager.js';
import {getAppConfig} from '../../lib/config.js';
import {MigrationFileMap} from '../../types.js';
import {log} from '../../lib/util.js';
import fs from 'node:fs';
import path from 'node:path';

export default new Command('make:statement')
  .description('Generage SQL statement from Elegant Migration')
  .requiredOption('-m, --migration <migration>', 'Migration class name')
  .option('-p, --outputDir <outputDir>', 'Output directory')
  .option('-o, --outputFile <outputFile>', 'Output file path')
  .option('-f, --force', 'Force overwrite existing file. Create directory if not exist')
  .option('-d, --debug', 'Enable debug mode')

  .action(async ( opt) => {
    const { migration } = opt;
    if (migration) {
        try {
            const statement = await migrationToStatement(migration)
            if (opt.outputFile) {
                if (fs.existsSync(opt.outputFile)) {
                    if (opt.force) {
                        fs.writeFileSync(opt.outputFile, statement, 'utf8')
                    } else {
                        throw new Error(`File ${opt.outputFile} does not exist`)
                    }
                } else {
                    if (!fs.existsSync(path.dirname(opt.outputFile))) {
                        if (opt.force) {
                            fs.mkdirSync(path.dirname(opt.outputFile))
                        } else {
                            throw new Error(`Directory ${opt.outputFile} does not exist`)
                        }
                    }
                    const filePath = path.resolve(opt.outputFile)
                    console.log(filePath)
                    fs.writeFileSync(filePath, statement, 'utf8')
                }
            } else if (opt.outputDir) {
                if (! fs.existsSync(opt.outputDir)) {
                    if (opt.force) {
                        fs.mkdirSync(opt.outputDir)
                    } else {
                        throw new Error(`File ${opt.outputDir} directory does not exist`)
                    }
                }
                const stats = fs.statSync(opt.outputDir)
                if (!stats.isDirectory()) {
                    throw new Error(`File ${opt.outputDir} is not a directory`)
                }
                const filePath = path.resolve(opt.outputDir, `${migration}.sql`);
                fs.writeFileSync(filePath, statement, 'utf8')

            } else {
                console.log(statement)
            }
        } catch (err) {
            if (opt.debug) {
                log(err.message, 'error')
            }
        }
    }

    await Elegant.disconnect()
  })


const migrationToStatement = async (migrationName:string) => {
    const db = await Elegant.singleton()
    const config = await getAppConfig()
    const migrationMgr = new MigrationManager(db, config)
    const filter = (file) => file.toLowerCase().includes(`${migrationName.toLowerCase()}.migration`)
    const migrationFileMaps:MigrationFileMap[] = await migrationMgr.getMigrationFileMap(filter)
    if (!migrationFileMaps.length) {
        throw Error(``)
    }

    const [migrationFileMap] = migrationFileMaps
    const { migration } = migrationFileMap
    {
        (migration.schema as any ).$.autoExecute = false
    }
    await migration.up();

    let statements:string[] = await Promise.all(migration.schema.tables.map(async (table) => (await table.toStatement())));

    return statements.join('\n\n')
}
