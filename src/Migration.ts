import Schema from './Schema.js';
import ElegantTable from '../lib/schema/ElegantTable.js';
import {ElegantConfig, MigrationMeta} from '../types.js';


export default abstract class Migration {
  protected connection:string;

  $:MigrationMeta = {
      config: undefined,
      tables: []
    }

  /**
   * Initializes the migration with a reference to the provided schema.
   * @param {Schema} schema - The schema instance associated with the migration.
   * @returns {void}
   */
  constructor(public schema?:Schema) {}

  /**
   * Abstract method to handle an upward operation or transition.
   * The specific behavior of this method should be defined in the subclass.
   *
   * @return {Promise<void>} A promise that resolves when the operation is complete.
   */
  public abstract up():Promise<any>

  /**
   * Executes an abstract operation to move or shift something downward or to a lower state.
   * This method should be implemented by a subclass.
   *
   * @return {Promise<void>} A promise that resolves when the operation is completed.
   */
  public abstract down():Promise<any>

  public shouldRun():boolean {
    return true
  }

  get config():ElegantConfig {
    return this.$.config
  }
  get tables():ElegantTable[] {
    return this.$.tables
  }
}
