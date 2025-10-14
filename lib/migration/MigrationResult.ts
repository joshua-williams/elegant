type MigrationAction =  'migrate'|'rollback'
type MigrationStatus = 'success'|'error'|'skip'
export default class MigrationResult {

  constructor(
    public name:string = '',
    public batchId:number = undefined,
    public action:MigrationAction = 'migrate',
    public status:MigrationStatus = 'success',
    public error:string = undefined,
    public timestamp:number = Date.now(),
    public duration:number = 0,
    public created_at:number = undefined) {
  }
}

