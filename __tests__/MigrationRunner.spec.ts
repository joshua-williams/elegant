import MigrationRunner from '../lib/migration/MigrationRunner.js';

describe.skip('migration', async () => {
  let runner:MigrationRunner = new MigrationRunner();
  await runner.init()

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
