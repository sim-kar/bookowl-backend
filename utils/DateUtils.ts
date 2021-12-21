export default class DateUtils {
  static formatDate(date: Date) {
    return [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
    ].join('-');
  }

  static getRelativeDate(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + (days));

    return date;
  }
}
