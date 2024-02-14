import { TOKEN_TYPE } from '../config/other-types/Enums';
import { AppDataSource } from '../db/data-source';
import { Token } from '../db/entities/token.entity';
import { sign, verify } from 'jsonwebtoken';

const tokenRepository = AppDataSource.getRepository(Token);

export const generateToken = (type: string, data: any) => {
  let token = '';
  if (type == TOKEN_TYPE.access) {
    token = sign(data, process.env.ACCESS_KEY, {
      expiresIn: process.env.ACCESS_EXP_TIME,
    });
  } else if (type == TOKEN_TYPE.refresh) {
    token = sign(data, process.env.REFRESH_KEY, {
      expiresIn: process.env.REFRESH_EXP_TIME,
    });
  }
  return token;
};
export const verifyToken = (type: string, token: string): boolean => {
  const tokenKey: string =
    type == TOKEN_TYPE.access
      ? process.env.ACCESS_KEY
      : process.env.REFRESH_KEY;
  let status: boolean = false;
  verify(token, tokenKey, (err, user) => {
    status = err ? false : true;
  });
  return status;
};
export const registerToken = async (token: string) => {
  let tokenItem = new Token();
  tokenItem.token = token;
  await tokenRepository.save(tokenItem);
  return tokenItem;
};
export const updateToken = async (id: string, token: string) => {
  await tokenRepository.update({ id: id }, { token: token });
  return;
};
