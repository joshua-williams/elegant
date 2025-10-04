import {run} from '../lib/migrate';
import {getAppConfig} from '../lib/config';

describe('migration', () => {
  it('should fun migration', async () => {
    console.log('mic check')
    await run('up')
  })
});
