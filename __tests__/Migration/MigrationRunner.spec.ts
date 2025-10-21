import MigrationRunner from '../../lib/migration/MigrationRunner.js';
import Elegant from '../../src/Elegant.js';
import {getAppConfig} from '../../lib/config.js';

describe.skip('migration', async () => {
  const db = await Elegant.connection()
  const config = await getAppConfig()
  let runner:MigrationRunner = new MigrationRunner(db, config);

  describe('run', () => {
    it('should run migrations', async () => {
      const results = await runner.run()
      expect(results).toBeInstanceOf(Array)

    })
    it('should rollback migrations', async () => {
      const results = await runner.rollback()
      expect(results).toBeInstanceOf(Array)
    })
  })
});
