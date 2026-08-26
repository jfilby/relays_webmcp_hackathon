export class BaseDataTypes {

  // Statuses
  static activeStatus = 'A'
  static completedStatus = 'C'
  static deletePendingStatus = 'P'
  static failedStatus = 'F'
  static newStatus = 'N'
  static inactiveStatus = 'I'

  static statusMap = {
    [this.activeStatus]: 'Active',
    [this.deletePendingStatus]: 'Delete pending'
  }

  static statusArray = [
    {
      value: this.activeStatus,
      name: 'Active'
    },
    {
      value: this.deletePendingStatus,
      name: 'Delete pending'
    }
  ]

  // Graph record statuses
  static graphStatusMap = {
    [this.activeStatus]: 'Published',
    [this.newStatus]: 'Draft',
    [this.deletePendingStatus]: 'Delete pending'
  }

  // Date/time
  static millisecondsInADay: number = 24 * 60 * 60 * 1000
}
