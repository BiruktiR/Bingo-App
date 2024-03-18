import moment from 'moment-timezone';
import { TMatch } from './other-types/match';
export const findIndexesOfNumber = async (
  pattern: number[],
  number: number
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
