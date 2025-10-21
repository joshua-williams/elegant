type MigrationAction =  'migrate'|'rollback'
type MigrationStatus = 'success'|'error'|'skip'

type MigrationResultType = {
  name:string,
  batchId:number,
  action:MigrationAction,
  status:MigrationStatus,
  error:string,
  timestamp:number,
  duration:number,
  created_at:number,
  statement:string
}
export default class MigrationResult {
  name:string
  batchId:number
  action:MigrationAction
  status:MigrationStatus
  error:string
  timestamp:number
  duration:number
  created_at:number
  statement:string

  constructor(migrationResult?: MigrationResultType) {
    if (migrationResult) {
      this.name = migrationResult.name
      this.batchId = migrationResult.batchId
      this.action = migrationResult.action
      this.status = migrationResult.status
      this.error = migrationResult.error
      this.timestamp = migrationResult.timestamp
      this.duration = migrationResult.duration
      this.created_at = migrationResult.created_at
      this.statement = migrationResult.statement
    }
  }
}

