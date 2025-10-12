import {Migration} from '@pristine/elegant'

class ElegantMigration extends Migration {
  async up() {
    await this.schema.create('elegant_migrations', (table) => {
      table.id()
      table.string('name')
      table.string('description')
      table.json('batch')
      table.timestamp('created_at')
        .default('CURRENT_TIMESTAMP')
        .onUpdate('CURRENT_TIMESTAMP')
    })
  }
  async down() {
    await this.schema.drop('elegant_migrations')
  }
}
