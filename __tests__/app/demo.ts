import {connection} from '../../src/eloquent';

const init = async () => {
  const db = await connection('forecastcrm')
}
//
// (async function() {
//   await init()
// })()

(async () => {
  const db = await connection('forecastcrm')
  console.log(db)
})();

