import Eloquent from '../src/eloquent'


describe('connection', () => {
  let db: Eloquent;
  beforeEach(async () => {
    db = await Eloquent.connection();
  })
  afterEach(async () => {
    await db.close()
  })

  it('should get Eloquent instance', async () => {
    expect(db).toBeInstanceOf(Eloquent);
  })
  it('should get default connection', async () => {
    db = await Eloquent.connection('forecastcrm')
    expect(db).toBeInstanceOf(Eloquent);
  })

  it('should select', async () => {
    db = await Eloquent.connection('forecastcrm')
    return db.select('select * from migrations')
      .then(res => {
        expect(res).toBeInstanceOf(Array)
      })
  })

  it('should insert', async () => {
    db = await Eloquent.connection('forecastcrm')
    return db.insert('insert into migrations (migration, batch) values (?,?)', ['test',5])
      .then(res => {
        expect(res).toBeInstanceOf(Number)
      })
  })
  it('should scalar', async () => {
    db = await Eloquent.connection('forecastcrm')
    return db.scalar('select count(*) from migrations')
      .then(res => {
        expect(res).toBeInstanceOf(Number)
      })
  })

  it('should update', async () => {
    db = await Eloquent.connection('forecastcrm')
    return db.update('update migrations set migration = ? where migration = ?', ['contact','contacts'])
      .then(res => {
        console.log(res)
      })
  })
  it('should delete', async () => {
    db = await Eloquent.connection('forecastcrm')
    return db.delete('delete from migrations where migration = ?', ['contact'])
      .then(res => {
        console.log(res)
      })
  })
  it('should statement', async () => {
    db = await Eloquent.connection('forecastcrm')
    let params = [
      ['test',5],
      ['test2',6],
      ['test3',7],
    ]
    return db.statement('insert into migrations (migration, batch) values (?,?)', params)
      .then(res => {
        console.log(res)
      })
  })
});
