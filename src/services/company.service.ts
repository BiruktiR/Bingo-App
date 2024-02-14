import { AppDataSource } from '../db/data-source';
import { TCompany } from '../config/zod-schemas/company.schema';
import { Company } from '../db/entities/company.entity';

const companyRepository = AppDataSource.getRepository(Company);

export const find = async () => {
  return companyRepository.find();
};
export const findByCompanyId = async (id: string) => {
  return companyRepository.findOneBy({ id: id });
};
export const findByName = async (name: string) => {
  return companyRepository.findOneBy({ name: name });
};
export const checkDupUpdate = async (company: TCompany) => {
  return companyRepository
    .createQueryBuilder('company')
    .where('company.id!=:companyID', { companyID: company.id })
    .andWhere('company.name=:companyName', { companyName: company.name })
    .getOne();
};
export const save = async (company: TCompany) => {
  await companyRepository.save(company);
};

export const modify = async (company: TCompany) => {
  await companyRepository.update({ id: company.id }, company);
  return findByCompanyId(company.id);
};
