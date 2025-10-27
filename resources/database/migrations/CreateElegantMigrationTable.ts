import { Migration, ElegantTable } from '@pristine/elegant'

export default class CreateElegantMigrationTable extends Migration {
  async up() {
    this.schema.createTable('elegant_migrations', (table:ElegantTable) => {
      table.id()
      table.bigInteger('batchId')
      table.char('action', 20)
      table.bigInteger('duration')
      table.string('name')
      table.string('status', 90)
      table.text('error')
      table.text('statement')
      table.timestamp('created_at')
        .onUpdate('CURRENT_TIMESTAMP')
        .default('CURRENT_TIMESTAMP')
        .notNull()
    })
  }
  async down() {
    await this.schema.dropTable('elegant_migrations')
    return
  }
}
