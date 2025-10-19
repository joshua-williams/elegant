import MigrationInspector from '../../lib/migration/MigrationInspector.js';
import {beforeAll} from 'vitest';

let inspector:MigrationInspector = new MigrationInspector();

describe('MigrationInspector', () => {
  beforeAll(async () => {
    await inspector.init()
  })
  it('getRanMigrations', async () => {

  })
});
