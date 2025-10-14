import { Migration } from '@pristine/elegant'

export default class CreateElegantMigrationTable extends Migration {
  async up() {
    await this.schema.create('elegant_migrations', (table) => {
      table.id()
      table.integer('batchId')
      table.char('action', 20)
      table.bigInteger('duration')
      table.string('name')
      table.timestamp('created_at')
        .default('CURRENT_TIMESTAMP')
    })
  }
  async down() {
    await this.schema.drop('elegant_migrations')
    return
  }
}
