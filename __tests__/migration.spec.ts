import {runMigrations} from '../lib/migrate';
import {getAppConfig} from '../lib/config';

describe('migration', () => {
  it('should create migration', async () => {
    const config = getAppConfig()
    return await runMigrations(config)
  })
});
