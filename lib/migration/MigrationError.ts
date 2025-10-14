import MigrationResult from './MigrationResult.js';

export default class MigrationError extends Error {
  result:MigrationResult = new MigrationResult()

  constructor(message:string, result:MigrationResult) {
    super(message)
    this.name = 'MigrationError'
    this.result = result
  }

  toString() {
    return JSON.stringify(this.result, null, 2)
  }
}
