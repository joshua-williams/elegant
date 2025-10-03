import Schema from './schema/schema';

export default abstract class Migration {
  private schema:typeof Schema = Schema
  /**
   * Represents the connection identifier as a string.
   * This variable points to a connection configured elegant.config.js
   */
  protected connection:string = 'default'
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
}
