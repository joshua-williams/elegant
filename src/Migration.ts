import Schema from './schema/Schema';
import ElegantTable from '../lib/schema/ElegantTable';
import {ElegantConfig, MigrationMeta} from '../types';


export default abstract class Migration {
  protected connection:string;
  public schema:Schema;

  $:MigrationMeta = {
      schema:undefined,
      config: undefined,
      tables: []
    }

  /**
   * Initializes the migration with a reference to the provided schema.
   * @param {Schema} schema - The schema instance associated with the migration.
   * @returns {void}
   */
  constructor(schema:Schema) {
    (schema as any).$.autoExecute = false;
    this.schema = schema;
    this.connection = this.connection ||  schema.config.default;
  }

  /**
   * Abstract method to handle an upward operation or transition.
   * The specific behavior of this method should be defined in the subclass.
   *
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  public abstract up():Promise<void>

  /**
   * Executes an abstract operation to move or shift something downward or to a lower state.
   * This method should be implemented by a subclass.
   *
   * @return {Promise<void>} A promise that resolves when the operation is completed.
   */
  public abstract down():Promise<void>

  public shouldRun():boolean {
    return true
  }

  getConnection():string {
    return this.connection
  }
  get config():ElegantConfig {
    return this.$.config
  }
  get tables():ElegantTable[] {
    return this.$.tables
  }
}
