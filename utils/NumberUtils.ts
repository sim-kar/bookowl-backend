export default class NumberUtils {
  // tries to convert value to number; returns undefined if it can't be converted
  static getNumber(value: any): number | undefined {
    let result;

    if (value) {
      result = parseInt(value.toString(), 10);
    }

    return Number.isNaN(result) ? undefined : result;
  }
}
