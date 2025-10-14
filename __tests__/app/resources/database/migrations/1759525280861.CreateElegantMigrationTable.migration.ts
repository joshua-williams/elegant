import { Migration } from '@pristine/elegant'

export default class CreateElegantMigrationTable extends Migration {
  async up() {
    await this.schema.create('elegant_migrations', (table) => {
      table.id()
      table.bigInteger('batchId')
      table.char('action', 20)
      table.bigInteger('duration')
      table.string('name')
      table.string('status', 90)
      table.text('error')
      table.timestamp('created_at')
        .default('CURRENT_TIMESTAMP')
        .onUpdate('CURRENT_TIMESTAMP')
    })
  }
  async down() {
    await this.schema.drop('elegant_migrations')
    return
  }
}
