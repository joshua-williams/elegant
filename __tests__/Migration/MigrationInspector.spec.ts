import MigrationInspector from '../../lib/migration/MigrationInspector.js';
import Elegant from '../../src/Elegant.js';
import {getAppConfig} from '../../lib/config.js';

describe('MigrationInspector', () => {
  let inspector: MigrationInspector;

  beforeAll(async () => {
    const db = await Elegant.connection()
    const config = await getAppConfig()
    inspector = new MigrationInspector(db, config)
  })
  afterAll(async() => {
    await Elegant.disconnect()
  })
  it('getRanMigrations', async () => {
    const status = await inspector.getStatus();
    expect(status).toBeDefined()
  })
});
