import { shuffle, range, slice } from 'lodash';
export const findRangeOfNumber = (number: number) => {
  let value: string = '';
  if (number >= 1 && number <= 15) {
    value = 'B';
  } else if (number >= 16 && number <= 30) {
    value = 'I';
  } else if (number >= 31 && number <= 45) {
    value = 'N';
  } else if (number >= 46 && number <= 60) {
    value = 'G';
  } else if (number >= 61 && number <= 75) {
    value = 'O';
  }
  return value;
};

export const generateUniqueRandomNumbers = (
  totalNumbers: number,
  min: number,
  max: number
) => {
  if (totalNumbers > max - min + 1) {
    throw new Error(
      'Cannot generate more unique numbers than the range allows.'
    );
  }
  const uniqueNumbers = shuffle(range(min, max + 1)).slice(0, totalNumbers);
  const numbersWithRange = uniqueNumbers.map((num) => {
    let numberRange = findRangeOfNumber(num);
    return {
      range: numberRange,
      number: num,
    };
  });
  return numbersWithRange;
};
