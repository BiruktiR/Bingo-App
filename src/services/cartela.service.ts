import { Cartela } from '../db/entities/cartela.entity';
import { AppDataSource } from '../db/data-source';
import {
  TCartela,
  TFindCartelaSchema,
} from '../config/zod-schemas/cartela.schema';
import { Branch } from '../db/entities/branch.entity';
import { ROLES } from '../config/other-types/Enums';
import { MetadataType } from '../config/other-types/metadata';
import { generateMetadata } from '../config/generate-metadata';
import { number } from 'zod';
import {
  convertToBingoArray,
  reverseConvertData,
} from '../config/util-functions';

const cartelaRepository = AppDataSource.getRepository(Cartela);

export const findCartela = async (
  role: string,
  branchID: string,
  filters: TFindCartelaSchema
) => {
  let data = await cartelaRepository
    .createQueryBuilder('cartelas')
    .leftJoinAndSelect('cartelas.branch', 'branch');
  if (role !== ROLES.superAdmin)
    await data.where('branch.id=:branchID', { branchID: branchID });
  if (filters?.id) {
    let id: number = parseInt(filters.id);
    await data.andWhere('cartelas.id=:cartelaID', { cartelaID: id });
  }
  if (filters?.branchID)
    await data.andWhere('branch.id=:cartelaBranchID', {
      cartelaBranchID: filters.branchID,
    });
  let page: number = !Number.isNaN(parseInt(filters.page))
    ? parseInt(filters.page)
    : 1;
  let limit: number = !Number.isNaN(parseInt(filters.limit))
    ? parseInt(filters.limit)
    : 51;
  let offset: number = limit * (page - 1);

  await data.skip(offset).take(limit);
  let count: number = await data.getCount();

  const metadata: MetadataType = await generateMetadata(page, limit, count);

  return {
    metadata: metadata,
    data: (await data.getMany()).map((x) => {
      return {
        id: x.id,
        branch: x.branch,
        board: reverseConvertData(JSON.parse(x.board)),
      };
    }),
  };
};
export const findCartelaById = async (
  id: number,
  role: string,
  branchID: string
) => {
  let data = await cartelaRepository
    .createQueryBuilder('cartelas')
    .leftJoinAndSelect('cartelas.branch', 'branch')
    .where('cartelas.id=:cartelaID', { cartelaID: id });
  if (role !== ROLES.superAdmin)
    await data.andWhere('branch.id=:branchID', { branchID: branchID });

  const cartela = await data.getOne();
  if (cartela == null) return null;
  return {
    id: cartela.id,
    branch: cartela.branch,
    board: JSON.parse(cartela.board),
  };
};
export const checkAddDuplicate = async (
  board: number[][],
  branchID: string
) => {
  const boardString: string = JSON.stringify(board);
  const cartela = await cartelaRepository
    .createQueryBuilder('cartelas')
    .where('cartelas.branchId=:branchID', { branchID: branchID })
    .andWhere('cartelas.board=:boardString', { boardString: boardString })
    .getOne();
  return cartela === null;
};
export const add = async (board: any, branch: Branch) => {
  let cartelaBoard = cartelaRepository.create({
    branch: branch,
    board: JSON.stringify(board),
  });

  await cartelaRepository.save(cartelaBoard);
};

export const checkUpdateDuplicate = async (
  board: TCartela,
  branchID: string,
  id: number
) => {
  const boardString: string = JSON.stringify(board.board);
  const cartela = await cartelaRepository
    .createQueryBuilder('cartelas')
    .where('cartelas.branchId=:branchID', { branchID: branchID })
    .andWhere('cartelas.board=:boardString', { boardString: boardString })
    .andWhere('cartelas.id!=:cartelaID', { cartelaID: id })
    .getOne();
  return cartela === null;
};
export const updateCartela = async (
  board: TCartela,
  id: number,
  role: string,
  branchID: string
) => {
  await cartelaRepository.update(
    { id: id },
    { board: JSON.stringify(board.board) }
  );
  return findCartelaById(id, role, branchID);
};

export const deleteById = async (id: number) => {
  await cartelaRepository.delete({ id: id });
  return;
};
