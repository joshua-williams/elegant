import Elegant from '../src/elegant'
import QueryBuilder from '../src/query-builder';


describe('connection', () => {
  let db: Elegant;
  beforeEach(async () => {
    db = await Elegant.connection();
  })
  afterEach(async () => {
    await db.close()
  })

  it('should get Elegant instance', async () => {
    expect(db).toBeInstanceOf(Elegant);
  })
  it('should get default connection', async () => {
    db = await Elegant.connection('mysql')
    expect(db).toBeInstanceOf(Elegant);
  })

  it('should select', async () => {
    db = await Elegant.connection('mysl')
    return db.select('select * from migrations')
      .then(res => {
        expect(res).toBeInstanceOf(Array)
      })
  })

  it('should insert', async () => {
    db = await Elegant.connection('forecastcrm')
    return db.insert('insert into migrations (migration, batch) values (?,?)', ['test',5])
      .then(res => {
        expect(typeof res).toBe('number')
      })
  })
  it('should scalar', async () => {
    db = await Elegant.connection('forecastcrm')
    return db.scalar('select count(*) from migrations')
      .then(res => {
        expect(typeof res).toBe('number')
      })
  })

  it('should update', async () => {
    db = await Elegant.connection('forecastcrm')
    return db.update('update migrations set migration = ? where migration = ?', ['contact','contacts'])
      .then(res => {
        expect(typeof res).toBe('number')
      })
  })
  it('should delete', async () => {
    db = await Elegant.connection('forecastcrm')
    return db.delete('delete from migrations where migration = ?', ['contact'])
      .then(res => {
        expect(typeof res).toBe('number')
      })
  })
  it('should statement', async () => {
    db = await Elegant.connection('forecastcrm')
    let params = [
      ['test',5],
      ['test2',6],
      ['test3',7],
    ]
    return db.statement('insert into migrations (migration, batch) values (?,?)', params)
      .then(response => {
        expect(response).toBeInstanceOf(Array)
        expect(response.length).toBe(3)
      })
  })

  it('should get query builder', async () => {
    const qb = db.table('migrations')
    expect(qb).toBeInstanceOf(QueryBuilder)
  })
});
