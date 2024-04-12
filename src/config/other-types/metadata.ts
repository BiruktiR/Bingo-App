import { TMatch } from './match';

export class MetadataType {
  startIndex: number;
  endIndex: number;
  limit: number;
  pagination?: {
    next?: {
      page: number;
      limit: number;
    };
    prev?: {
      page: number;
      limit: number;
    };
  };

  currentPage: number;
  total: number;
}
export interface InputData {
  B: number[];
  I: number[];
  N: number[];
  G: number[];
  O: number[];
}
export interface InputBoolean {
  B: boolean[];
  I: boolean[];
  N: boolean[];
  G: boolean[];
  O: boolean[];
}
export interface OutputMatchBoard {
  B: TMatch[];
  I: TMatch[];
  N: TMatch[];
  G: TMatch[];
  O: TMatch[];
}
export type CustomizedRandomNumbers = {
  value: string;
  amharic_url: string;
  oromiffa_url: string;
};
