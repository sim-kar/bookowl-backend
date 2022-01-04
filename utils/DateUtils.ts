/** Utility methods for dates. */
export default class DateUtils {
  /**
   * Get a string in YYYY-MM-DD format.
   *
   * @param date the date to format.
   * @returns the date as a formatted string.
   */
  static formatDate(date: Date) {
    return [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
    ].join('-');
  }

  /**
   * Get the date relative to the current date by the given number of days. A negative number will
   * give the past relative date; a positive number the future relative date.
   *
   * @param days the number of days from the current date.
   * @returns the relative date.
   */
  static getRelativeDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + (days));

    return date;
  }
}
