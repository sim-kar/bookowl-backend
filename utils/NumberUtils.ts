export default class NumberUtils {
  // tries to convert value to number; returns undefined if it can't be converted
  static getNumberOrUndefined(value: any): number | undefined {
    let result;

    if (value) {
      result = parseInt(value.toString(), 10);
    }

    return Number.isNaN(result) ? undefined : result;
  }

  // tries to convert value to number; returns 0 if it can't be converted
  static getNumber(value: any): number {
    let result = 0;

    if (value) {
      result = parseInt(value.toString(), 10);
    }

    return Number.isNaN(result) ? 0 : result;
  }
}
