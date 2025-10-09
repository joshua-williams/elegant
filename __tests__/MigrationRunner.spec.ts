import MigrationRunner from '../lib/MigrationRunner';

describe('migration', async () => {
  let runner:MigrationRunner = new MigrationRunner();
  await runner.init()

  describe('run', () => {
    it('should run migrations', async () => {
      await runner.run('up')

    })
    it('should rollback migrations', async () => {
      await runner.run('down')
    })
  })
});
