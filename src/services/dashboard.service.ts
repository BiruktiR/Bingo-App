import { AppDataSource } from '../db/data-source';

const entityManager = AppDataSource.createEntityManager();

export const getSales = async (
  start: string,
  end: string,
  branchID: string
) => {
  let query = `SELECT COALESCE(SUM(g.bet * g.number_of_players * g.type * 5 / 100),0) as sum_numbers
  FROM (
  SELECT
  bingo_db.games.id,
  COALESCE(COUNT(gc.gameId), 0) as number_of_players,
  bingo_db.games.bet as bet,
  bingo_db.games.type as type
  FROM bingo_db.games
  LEFT JOIN bingo_db.game_cartelas as gc
  ON gc.gameId = bingo_db.games.id
  WHERE (bingo_db.games.date >= '${start}')
  AND (bingo_db.games.date < '${end}')
  AND (bingo_db.games.branchId = '${branchID}')
  ) AS g;`;
  let data = await entityManager.query(query);

  return parseInt(data[0].sum_numbers);
};

export const getTotalSales = async (
  start: string,
  end: string,
  companyID: string
) => {
  let query = `SELECT COALESCE(SUM(g.bet * g.number_of_players * g.type * 5 / 100),0) as total_monthly_sales
    FROM (
    SELECT bingo_db.games.id,
    COALESCE(COUNT(gc.gameId), 0) as number_of_players,
    bingo_db.games.bet as bet,
    bingo_db.games.type as type from bingo_db.games
    LEFT JOIN bingo_db.branches as b
    ON b.id=bingo_db.games.branchId
    LEFT JOIN bingo_db.game_cartelas as gc
    ON gc.gameId = bingo_db.games.id
    WHERE (bingo_db.games.date>='${start}') 
    AND (bingo_db.games.date<'${end}') 
    AND (b.companyId='${companyID}')) AS g;`;

  let data = await entityManager.query(query);
  console.log(data);
  return parseInt(data[0].total_monthly_sales);
};
