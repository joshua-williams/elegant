import { Migration } from '@pristine/elegant'

export default class UsersMigration extends Migration {
  /**
   * Performs the migration or schema update using the given database instance.
   *
   * @return {void} This method does not return a value.
   */
  async up() {
    return this.schema.createTable('users', (table) => {
      table.id().autoIncrement().primary()
      table.char('first_name', 90)
      table.char('last_name', 90)
      table.string('email', 90)
      table.char('password', 90)
      table.string('phone', 90)
      table.string('address', 90)
      table.char('city', 45)
      table.char('state', 2)
      table.char('zip', 5)
      table.char('country', 3)
    })
  }

  /**
   * Reverts the migration or schema update performed by the up() method.
   * This method should undo the changes made by the up() method.
   * @return {void} This method does not return a value.
   */
  down() {
    this.schema.dropTable('users', (table) => {
      table.ifExists()
    })
  }
}
