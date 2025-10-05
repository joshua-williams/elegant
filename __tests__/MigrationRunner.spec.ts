import MigrationRunner from '../lib/MigrationRunner';
import {getAppConfig} from '../lib/config';

describe('migration', () => {
  let runner:MigrationRunner = new MigrationRunner();

  describe('run', () => {
    it('should run migrations', async () => {
      await runner.run('up')

    })
    it('should rollback migrations', async () => {
      await runner.run('down')
    })
  })
});
