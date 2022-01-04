/** Utility methods for numbers, such as converting other types to numbers. */
export default class NumberUtils {
  /**
   * Convert a value of any type to an integer number.
   * If it cannot be converted, undefined is returned.
   *
   * @param value the value to convert.
   * @returns an integer number or undefined.
   */
  static getNumberOrUndefined(value: any): number | undefined {
    let result;

    if (value) {
      result = parseInt(value.toString(), 10);
    }

    return Number.isNaN(result) ? undefined : result;
  }

  /**
   * Convert a value of any type to an integer number.
   * If it cannot be converted, -1 is returned.
   *
   * @param value the value to convert.
   * @returns an integer number.
   */
  static getNumber(value: any): number {
    let result = -1;

    if (value) {
      result = parseInt(value.toString(), 10);
    }

    return Number.isNaN(result) ? -1 : result;
  }
}
