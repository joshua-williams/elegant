import MigrationInspector from '../lib/MigrationInspector.js';
import {beforeAll} from 'vitest';

let inspector:MigrationInspector = new MigrationInspector();

describe('MigrationInspector', () => {
  beforeAll(async () => {
    await inspector.init()
  })
  it('getRanMigrations', async () => {
    const files =await  inspector.getRanMigrations()
    console.log('---files---', files)
    expect(files).toBeInstanceOf(Array)
  })
});
