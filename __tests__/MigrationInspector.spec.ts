import MigrationInspector from '../lib/MigrationInspector';
import {beforeAll} from 'vitest';

let inspector:MigrationInspector = new MigrationInspector();

describe('MigrationInspector', () => {
  beforeAll(async () => {
    await inspector.init()
  })
  it('getRanMigrations', () => {
    const files = inspector.getRanMigrations()
    console.log('---files---', files)
    expect(files).toBeInstanceOf(Array)
  })
});
