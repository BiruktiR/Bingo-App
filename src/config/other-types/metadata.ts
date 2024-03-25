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
