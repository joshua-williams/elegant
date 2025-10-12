import {ElegantTestSuite} from './ElegantTestSuite.js';

describe('Elegant', async () => {
  ElegantTestSuite('mysql')
  ElegantTestSuite('mariadb')
  ElegantTestSuite('postgres')
  ElegantTestSuite('sqlite')

})
