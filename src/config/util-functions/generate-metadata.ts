import { MetadataType } from '../other-types/metadata';

export const generateMetadata = async (
  page: number,
  limit: number,
  count: number
): Promise<MetadataType> => {
  const metadata: MetadataType = new MetadataType();
  metadata.startIndex = (page - 1) * limit;
  metadata.endIndex = page * limit;

  if (metadata.endIndex < count && metadata.startIndex > 0) {
    metadata.pagination = {
      next: {
        page: page + 1,
        limit: limit,
      },
      prev: {
        page: page - 1,
        limit: limit,
      },
    };
  } else if (metadata.endIndex < count) {
    metadata.pagination = {
      next: {
        page: page + 1,
        limit: limit,
      },
    };
  } else if (metadata.startIndex > 0) {
    metadata.pagination = {
      prev: {
        page: page - 1,
        limit: limit,
      },
    };
  }
  metadata.currentPage = page;
  metadata.total = count;

  return metadata;
};
