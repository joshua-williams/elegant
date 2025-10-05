import {getMigrations, run} from '../lib/migration';
import {getAppConfig} from '../lib/config';

describe('migration', () => {
  let config;
  it('should get config', async () => {
    config = await getAppConfig()
  })
  it('should get migrations', async () => {
    const migrations = await getMigrations(config)
    expect(migrations).toBeInstanceOf(Array)
  })

  describe('run', () => {
    it('should run migrations', async () => {
      await run('up')

    })
    it('should rollback migrations', async () => {
      await run('down')
    })
  })
});
