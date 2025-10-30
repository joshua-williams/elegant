import QueryBuilder from '../../src/QueryBuilder.js';
import Elegant from '../../src/Elegant.js';

export default class ElegantQueryBuilder extends QueryBuilder {

  constructor(private db:Elegant) {
    super();
  }

  first<T>():Promise<T> {
    const {query, params} = this.toStatement();
    return this.db.query(query, params)
      .then((rows: T[]) => rows.length ? rows[0] : null)
  }

  get<T>():Promise<T[]> {
    const {query, params} = this.toStatement();
    return this.db.query(query, params).then((rows:T[]) => rows)
  }
}
