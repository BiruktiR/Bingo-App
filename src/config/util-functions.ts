import moment from 'moment-timezone';
import { TMatch } from './other-types/match';
import {
  InputBoolean,
  InputData,
  OutputMatchBoard,
} from './other-types/metadata';
import { DATE_TYPE } from './other-types/Enums';
export const findIndexesOfNumber = async (
  pattern: boolean[],
  number: boolean
) => {
  const indices: number[] = [];
  pattern.forEach((element, index) => {
    if (element === number) {
      indices.push(index);
    }
  });
  return indices;
};
export const getDate = async () => {
  const date = new Date();
  const convertedDate = moment(date).tz('Europe/Moscow');
  return convertedDate.format('YYYY-MM-DD');
};
export const convertTo2DArray = async (arr: TMatch[]) => {
  var newArr = [];
  for (var i = 0; i < 5; i++) {
    newArr.push(arr.slice(i * 5, (i + 1) * 5));
  }
  return newArr;
};
export const convertToBingoArray = (arr: number[][]) => {
  if (arr == null) return null;
  return arr.map((row) => ({
    B: row[0],
    I: row[1],
    N: row[2],
    G: row[3],
    O: row[4],
  }));
};
// export function convertData(input: InputData): number[][] {
//   const result: number[][] = [];
//   const keys = Object.keys(input) as (keyof InputData)[];
//   const maxLength = Math.max(...keys.map((key) => input[key].length));

//   for (let i = 0; i < maxLength; i++) {
//     const row: number[] = [];
//     for (const key of keys) {
//       row.push(input[key][i] || null); // Handle missing values if any list is shorter
//     }
//     result.push(row);
//   }

//   return result;
// }
export function convertData(input: InputData): number[][] {
  const result: number[][] = [];
  const keys = Object.keys(input) as (keyof InputData)[]; // Type assertion to specify the key type
  const maxLength = Math.max(...keys.map((key) => input[key].length));

  for (let i = 0; i < maxLength; i++) {
    const row: number[] = [];
    for (const key of keys) {
      const value = input[key][i];
      row.push(value !== undefined ? value : null); // If value is undefined, replace with null
    }
    result.push(row);
  }

  return result;
}
export function convertBool(input: InputBoolean): boolean[][] {
  const result: boolean[][] = [];
  const keys = Object.keys(input) as (keyof InputData)[];
  const maxLength = Math.max(...keys.map((key) => input[key].length));

  for (let i = 0; i < maxLength; i++) {
    const row: boolean[] = [];
    for (const key of keys) {
      const value = input[key][i];
      row.push(value !== undefined ? value : false); // If value is undefined, replace with false
    }
    result.push(row);
  }

  return result;
}
export function reverseConvertData(input: number[][]): InputData {
  if (input == null) return null;
  const result: InputData = { B: [], I: [], N: [], G: [], O: [] };
  const maxLength = Math.max(...input.map((arr) => arr.length));

  for (let i = 0; i < maxLength; i++) {
    for (const [index, key] of Object.keys(result).entries()) {
      if (input[i]) {
        result[key as keyof InputData].push(input[i][index]);
      } else {
        result[key as keyof InputData].push(null);
      }
    }
  }

  return result;
}
export function reverseConvertBoolean(input: boolean[][]): InputBoolean {
  if (input == null) return null;
  const result: InputBoolean = { B: [], I: [], N: [], G: [], O: [] };
  const maxLength = Math.max(...input.map((arr) => arr.length));

  for (let i = 0; i < maxLength; i++) {
    for (const [index, key] of Object.keys(result).entries()) {
      if (input[i]) {
        result[key as keyof InputBoolean].push(input[i][index]);
      } else {
        result[key as keyof InputBoolean].push(null);
      }
    }
  }

  return result;
}
export function reverseMatchBoard(input: TMatch[][]): OutputMatchBoard {
  if (input == null) return null;
  const result: OutputMatchBoard = { B: [], I: [], N: [], G: [], O: [] };
  const maxLength = Math.max(...input.map((arr) => arr.length));

  for (let i = 0; i < maxLength; i++) {
    for (const [index, key] of Object.keys(result).entries()) {
      if (input[i]) {
        result[key as keyof OutputMatchBoard].push(input[i][index]);
      } else {
        result[key as keyof OutputMatchBoard].push(null);
      }
    }
  }

  return result;
}
export function guessTimezone(): string {
  return moment.tz.guess();
}
export function getMomentDate(date: string, type: string) {
  let currentTimezone = guessTimezone();
  let parsedDate = moment(date);
  let firstConversion =
    type == DATE_TYPE.start
      ? parsedDate.startOf('day')
      : parsedDate.endOf('day');

  // const guessedOffset = moment.tz(currentTimezone).utcOffset();
  // const hoursToSubtract = (guessedOffset - 180) / 60;
  // return firstConversion
  //   .clone()
  //   .add(hoursToSubtract + guessedOffset / 60, 'hours')
  //   .toDate();
  return firstConversion.utc().toDate();
}
export function getUTCDate() {
  return moment(new Date()).utc().toDate();
}
export function getEthiopianDate(date: Date) {
  return moment(date).clone().add(3, 'hours').toDate();
}
export function getMomentStartEnd() {
  let parsedDate = moment(new Date()).utc();

  let currentTimezone = guessTimezone();
  const guessedOffset = moment.tz(currentTimezone).utcOffset();
  const hoursToSubtract = guessedOffset / 60;

  let todayStart = parsedDate
    .startOf('day')
    .clone()
    .subtract(hoursToSubtract, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  let todayEnd = parsedDate
    .endOf('day')
    .clone()
    .subtract(hoursToSubtract, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  let weekStart = parsedDate
    .startOf('isoWeek')
    .clone()
    .subtract(hoursToSubtract, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  let weekEnd = parsedDate
    .endOf('isoWeek')
    .clone()
    .subtract(hoursToSubtract, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  let monthStart = parsedDate
    .startOf('month')
    .clone()
    .subtract(hoursToSubtract, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  let monthEnd = parsedDate
    .endOf('month')
    .clone()
    .subtract(hoursToSubtract, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  let yearStart = parsedDate
    .startOf('year')
    .clone()
    .subtract(hoursToSubtract, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  let yearEnd = parsedDate
    .endOf('year')
    .clone()
    .subtract(hoursToSubtract, 'hours')
    .format('YYYY-MM-DD HH:mm:ss');
  return {
    todayStart,
    todayEnd,
    weekStart,
    weekEnd,
    monthStart,
    monthEnd,
    yearStart,
    yearEnd,
  };
}
