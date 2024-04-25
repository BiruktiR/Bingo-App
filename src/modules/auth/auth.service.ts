import { genSalt, hash, compare } from 'bcrypt';
export const encryptPassword = async (password: string) => {
  const salt = await genSalt(10);
  return hash(password, salt);
};
export const isPasswordCorrect = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return compare(password, hash);
};
