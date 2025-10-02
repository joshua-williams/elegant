import Elegant,{ Migration } from 'elegant'

class MigrationClass extends Migration {

  /**
   * Performs the migration or schema update using the given database instance.
   *
   * @param {Elegant} db - The database instance to apply the migration or update to.
   * @return {void} This method does not return a value.
   */
  up(db) {

  }

  /**
   * Reverts the migration or schema update performed by the up() method.
   * This method should undo the changes made by the up() method.
   * @param {Elegant} db - The database instance to revert the migration or update to.
   * @return {void} This method does not return a value.
   */
  down(db) {

  }
}
