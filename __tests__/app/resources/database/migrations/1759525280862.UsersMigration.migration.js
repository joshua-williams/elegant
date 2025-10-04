import Elegant,{ Migration, SchemaTable } from 'elegant'

export default class UsersMigration extends Migration {

  /**
   * Performs the migration or schema update using tgiven database instance.
   *
   * @return {void} This method does not return a value.
   */
  up() {
    this.schema.create('users', (table) => {
      table.id()
      table.char('first_name', 90)
    })
  }

  /**
   * Reverts the migration or schema update performed by the up() method.
   * This method should undo the changes made by the up() method.
   * @return {void} This method does not return a value.
   */
  down() {

  }
}
