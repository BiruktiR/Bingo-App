import { AppDataSource } from '../db/data-source';
import {
  TCompany,
  TFindCompanySchema,
} from '../config/zod-schemas/company.schema';
import { Company } from '../db/entities/company.entity';
import { MetadataType } from '../config/other-types/metadata';
import { generateMetadata } from '../config/generate-metadata';

const companyRepository = AppDataSource.getRepository(Company);

export const find = async (filters: TFindCompanySchema) => {
  let company = await companyRepository.createQueryBuilder('companies');
  if (filters?.id)
    await company.andWhere('companies.id=:companyID', {
      companyID: filters.companyID,
    });
  if (filters?.name)
    await company.andWhere('companies.name like :companyName', {
      companyName: `%${filters.name}%`,
    });
  let page: number = !Number.isNaN(parseInt(filters.page))
    ? parseInt(filters.page)
    : 1;
  let limit: number = !Number.isNaN(parseInt(filters.limit))
    ? parseInt(filters.limit)
    : 20;
  let offset: number = limit * (page - 1);

  await company.skip(offset).take(limit);
  let count: number = await company.getCount();

  const metadata: MetadataType = await generateMetadata(page, limit, count);

  return {
    metadata: metadata,
    data: await company.getMany(),
  };
};
export const findByCompanyId = async (id: string) => {
  return companyRepository.findOneBy({ id: id });
};
export const findByName = async (name: string) => {
  return companyRepository.findOneBy({ name: name });
};
export const checkDupUpdate = async (company: TCompany) => {
  return companyRepository
    .createQueryBuilder('companies')
    .where('companies.id!=:companyID', { companyID: company.id })
    .andWhere('companies.name=:companyName', { companyName: company.name })
    .getOne();
};
export const save = async (company: TCompany) => {
  await companyRepository.save(company);
};

export const modify = async (company: TCompany) => {
  await companyRepository.update({ id: company.id }, company);
  return findByCompanyId(company.id);
};
