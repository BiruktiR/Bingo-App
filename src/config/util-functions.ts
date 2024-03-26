import moment from 'moment-timezone';
import { TMatch } from './other-types/match';
import { InputData } from './other-types/metadata';
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
export function reverseConvertData(input: number[][]): InputData {
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
