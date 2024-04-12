import { shuffle, range, slice, attempt, random } from 'lodash';
import { LANGUAGES, RANDOM_TYPE, ROLES } from '../config/other-types/Enums';
import { Cartela } from '../db/entities/cartela.entity';
import { Branch } from '../db/entities/branch.entity';
import { User } from '../db/entities/user.entity';
import { Game } from '../db/entities/game.entity';
import { AppDataSource } from '../db/data-source';
import { GameCartela } from '../db/entities/game_cartela.entity';
import { TFindGameSchema } from '../config/zod-schemas/game.schema';
import {
  CustomizedRandomNumbers,
  MetadataType,
} from '../config/other-types/metadata';
import { generateMetadata } from '../config/generate-metadata';
import { TMatch } from '../config/other-types/match';
import {
  convertTo2DArray,
  convertToBingoArray,
  getEthiopianDate,
  reverseConvertBoolean,
  reverseMatchBoard,
} from '../config/util-functions';
import { number } from 'zod';

const gameRepository = AppDataSource.getRepository(Game);
const gameCartelaRepository = AppDataSource.getRepository(GameCartela);
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
// export const getCustomizedRandomNumbers = (numbers: number[]) => {
//   let data: CustomizedRandomNumbers[] = [];
//   for (let x = 0; x < numbers.length; x++) {
//     let numberRange = findRangeOfNumber(numbers[x]);
//     data.push({
//       value: numberRange + numbers[x],
//       amharic_url:
//         process.env.API_GATEWAY +
//         process.env.PORT_NUMBER +
//         process.env.API_EXTENSION +
//         'transcription/' +
//         LANGUAGES.amharic +
//         '/' +
//         numberRange.toLowerCase() +
//         +numbers[x],
//       oromiffa_url:
//         process.env.API_GATEWAY +
//         process.env.PORT_NUMBER +
//         process.env.API_EXTENSION +
//         'transcription/' +
//         LANGUAGES.oromiffa +
//         '/' +
//         numberRange.toLowerCase() +
//         +numbers[x],
//     });
//   }
//   return data;
// };
export const findWinners = (
  array: {
    id: string;
    cartela: Cartela;
    game: Game;
    matched_board: any;
    attempts: number;
    is_fully_matched: boolean;
  }[]
) => {
  let minSteps = Infinity;
  let winners: {
    id: string;
    cartela: Cartela;
    game: Game;
    matched_board: any;
    attempts: number;
    is_fully_matched: boolean;
  }[] = [];

  array.forEach((obj) => {
    if (obj.is_fully_matched && obj.attempts < minSteps) {
      minSteps = obj.attempts;

      winners = [obj];
    } else if (obj.is_fully_matched && obj.attempts === minSteps) {
      winners.push(obj);
    }
  });

  return winners;
};
export const findGame = async (
  role: string,
  user: User,
  filters: TFindGameSchema
) => {
  let game = await gameRepository
    .createQueryBuilder('games')
    .leftJoinAndSelect('games.branch', 'branch')
    .leftJoinAndSelect('games.game_cartelas', 'game_cartelas')
    .leftJoinAndSelect('game_cartelas.cartela', 'cartela')
    .leftJoinAndSelect('games.player', 'player');
  if (role !== ROLES.superAdmin) {
    await game.andWhere('branch.id=:branchID', { branchID: user.branch.id });
  }
  if (filters?.id)
    await game.andWhere('games.id=:gameID', { gameID: filters.id });
  if (filters?.cartelaID)
    await game.andWhere('cartela.id=:cartelaID', {
      cartelaID: filters.cartelaID,
    });
  if (role === ROLES.superAdmin && filters?.branchID)
    await game.andWhere('branch.id=:branchID', { branchID: filters.branchID });
  if (filters?.start_date)
    await game.andWhere('games.date >= :startDate', {
      startDate: filters.start_date,
    });
  if (filters?.end_date)
    await game.andWhere('games.date <= :endDate', {
      endDate: filters.end_date,
    });
  if (filters?.userID) {
    await game.andWhere('player.id=:playerID', { playerID: filters?.userID });
  }
  let page: number = !Number.isNaN(parseInt(filters.page))
    ? parseInt(filters.page)
    : 1;
  let limit: number = !Number.isNaN(parseInt(filters.limit))
    ? parseInt(filters.limit)
    : 51;
  let offset: number = limit * (page - 1);

  await game.skip(offset).take(limit);
  let count: number = await game.getCount();

  const metadata: MetadataType = await generateMetadata(page, limit, count);
  return {
    metadata: metadata,
    data: (await game.getMany()).map((data) => {
      let initialEarning: number = data.bet * data.game_cartelas.length;
      let percentageCut: number = initialEarning * ((data.type * 5) / 100);
      let winners = findWinners(data.game_cartelas);

      return {
        id: data.id,
        called_numbers: JSON.parse(data.called_numbers),
        pattern: reverseConvertBoolean(JSON.parse(data.pattern)),
        bet: data.bet,
        branch: data.branch,
        date: getEthiopianDate(data.date),
        type: data.type * 5,
        number_of_players: data.game_cartelas.length,
        number_of_winners: winners.length,
        steps: winners.length > 0 ? winners[0].attempts : 0,
        winners: winners.map((y) => {
          return {
            id: y.id,
            cartela: y.cartela,
            game: y.game,
            matched_board:
              y.matched_board !== ''
                ? reverseMatchBoard(JSON.parse(y.matched_board))
                : '',
            attempts: y.attempts,
            is_fully_matched: y.is_fully_matched,
          };
        }),
        player: data.player,
        total_won: initialEarning,
        cut: percentageCut,
        player_won: initialEarning - percentageCut,
      };
    }),
  };
};
export const findGameById = async (id: string) => {
  let game = await gameRepository
    .createQueryBuilder('games')
    .leftJoinAndSelect('games.branch', 'branch')
    .leftJoinAndSelect('games.game_cartelas', 'game_cartelas')
    .leftJoinAndSelect('game_cartelas.cartela', 'cartela')
    .leftJoinAndSelect('games.player', 'player')
    .where('games.id=:gameID', { gameID: id })
    .getOne();
  if (game == null) return null;
  let initialEarning: number = game.bet * game.game_cartelas.length;
  let percentageCut: number = initialEarning * ((game.type * 5) / 100);
  let { called_numbers, pattern } = game;
  game.date = getEthiopianDate(game.date);

  return {
    ...game,
    game_cartelas: game.game_cartelas.map((y) => {
      return {
        id: y.id,
        cartela: y.cartela,
        game: y.game,
        matched_board:
          y.matched_board !== '' ? JSON.parse(y.matched_board) : null,
        attempts: y.attempts,
        is_fully_matched: y.is_fully_matched,
      };
    }),
    called_numbers: JSON.parse(called_numbers),
    pattern: JSON.parse(pattern),
    total_winning: initialEarning,
    cut: percentageCut,
    player_winning: initialEarning - percentageCut,
  };
};
export const findGameRaw = async (id: string) => {
  let game = await gameRepository
    .createQueryBuilder('games')
    .leftJoinAndSelect('games.branch', 'branch')
    .leftJoinAndSelect('games.game_cartelas', 'game_cartelas')
    .leftJoinAndSelect('game_cartelas.cartela', 'cartela')
    .leftJoinAndSelect('games.player', 'player')
    .where('games.id=:gameID', { gameID: id })
    .getOne();
  return game;
};
export const generateUniqueRandomNumbers = (
  totalNumbers: number,
  min: number,
  max: number,
  type: string
) => {
  if (totalNumbers > max - min + 1) {
    throw new Error(
      'Cannot generate more unique numbers than the range allows.'
    );
  }
  const uniqueNumbers = shuffle(range(min, max + 1)).slice(0, totalNumbers);
  if (type === RANDOM_TYPE.raw) return uniqueNumbers;
  // const numbersWithRange = uniqueNumbers.map((num) => {
  //   let numberRange = findRangeOfNumber(num);
  //   return {
  //     range: numberRange,
  //     number: num,
  //   };
  // });
  // return numbersWithRange;
};
export const generateCustomBoard = async (board: number[]) => {
  return board.map((x) => {
    return {
      value: x,
      isMatched: false,
    };
  });
};
export const getBingoAttempts = async (
  indexArray: number[],
  randomNumbers: number[],
  cartela: Cartela,
  steps: number
) => {
  const board: number[] = JSON.parse(cartela.board).flat();
  let matchBoard = await generateCustomBoard(board);
  let isFullyMatched: boolean = false;

  let attempts: number = 0;
  let numberOfPatternsMatched: number = 0;
  for (let x = 0; x < steps; x++) {
    let index = board.indexOf(randomNumbers[x]);

    if (index == -1 && numberOfPatternsMatched < indexArray.length - 1) {
      attempts++;
      continue;
    } else if (index !== -1) {
      matchBoard[index].isMatched = true;
      if (indexArray.includes(index)) {
        numberOfPatternsMatched++;
        if (numberOfPatternsMatched == indexArray.length) {
          isFullyMatched = true;
          x = randomNumbers.length + 1;
        }
      }
    }
    attempts++;
  }

  return {
    attempts: attempts,
    matchBoard: await convertTo2DArray(matchBoard),
    isFullyMatched: isFullyMatched,
  };
};
export const addGame = async (
  randomNumbers: number[],
  pattern: number[][],
  branch: Branch,
  generatedDate: Date,
  type: number,
  user: User,
  bet: number
) => {
  let game = await gameRepository.create({
    called_numbers: JSON.stringify(randomNumbers),
    pattern: JSON.stringify(pattern),
    branch: branch,
    date: generatedDate,
    player: user,
    type: type,
    bet: bet,
  });

  await gameRepository.save(game);
  return game;
};
export const addGameCartela = async (game: Game, cartela: Cartela) => {
  // let matchboard: string = '';
  // // if (indexArrayLength == 0) {
  // //   const board: number[] = JSON.parse(cartela.board).flat();
  // //   let matchBoard2d = await convertTo2DArray(await generateCustomBoard(board));
  // //   matchboard = JSON.stringify(matchBoard2d);
  // // }
  let gameCartela = gameCartelaRepository.create({
    cartela: cartela,
    game: game,
    attempts: 0,
    matched_board: '',
    is_fully_matched: false,
  });
  await gameCartelaRepository.save(gameCartela);
};

export const updateGameCartela = async (gameCartela: {
  id: string;
  cartela: Cartela;
  game: Game;
  matched_board: any;
  attempts: number;
  is_fully_matched: boolean;
}) => {
  await gameCartelaRepository.update(
    { id: gameCartela.id },
    {
      matched_board: JSON.stringify(gameCartela.matched_board),
      attempts: gameCartela.attempts,
      is_fully_matched: gameCartela.is_fully_matched,
    }
  );
};
export const findAndRemoveObjectById = async (
  array: {
    id: string;
    cartela: Cartela;
    game: Game;
    matched_board: any;
    attempts: number;
    is_fully_matched: boolean;
  }[],
  id: number
) => {
  const index = array.findIndex((obj) => obj.cartela.id === id);
  if (index !== -1) {
    const removedObject = array.splice(index, 1)[0];
    return removedObject;
  }
  return null;
};
export const deleteCartelaFromGame = async (id: string) => {
  await gameCartelaRepository.delete({ id: id });
};
export const removeGame = async (id: string) => {
  await gameRepository.delete({ id: id });
};
