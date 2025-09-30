import Eloquent from '../src/eloquent'


describe('connection', () => {
  let db: Eloquent;
  beforeEach(async () => {

  })
  it('should get Eloquent instance', async () => {
    db = await Eloquent.connection();
    expect(db).toBeInstanceOf(Eloquent);
  })
  it('should get default connection', async () => {
    db = await Eloquent.connection('forecastcrm')
    expect(db).toBeInstanceOf(Eloquent);
  })
});
