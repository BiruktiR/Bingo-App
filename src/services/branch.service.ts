import { AppDataSource } from '../db/data-source';
import { TBranch } from '../config/zod-schemas/branch.schema';
import { Not } from 'typeorm';
import { TCompany } from '../config/zod-schemas/company.schema';
import { Branch } from '../db/entities/branch.entity';
import { Company } from 'src/db/entities/company.entity';

const branchRepository = AppDataSource.getRepository(Branch);

export const find = async () => {
  return branchRepository.find({
    relations: {
      company: true,
    },
  });
};
export const findById = async (id: string, companyID: string) => {
  return branchRepository
    .createQueryBuilder('branches')
    .leftJoinAndSelect('branches.company', 'company')
    .where('branches.id=:branchID', { branchID: id })
    .andWhere('branches.companyId=:companyID', { companyID: companyID })
    .getOne();
};
export const findByName = async (name: string, companyID: string) => {
  return branchRepository
    .createQueryBuilder('branches')
    .where('branches.companyId=:companyID', { companyID: companyID })
    .andWhere('branches.name=:branchName', { branchName: name })
    .getOne();
};
export const checkDupUpdate = async (branch: TBranch, companyID: string) => {
  return branchRepository
    .createQueryBuilder('branches')
    .where('branches.id!=:branchID', { branchID: branch.id })
    .andWhere('branches.name=:branchName', { branchName: branch.name })
    .andWhere('branches.companyId=:companyID', { companyID: companyID })
    .getOne();
};
export const save = async (branch: TBranch, company: Company) => {
  await branchRepository.save({
    ...branch,
    company: company,
  });
};

export const modify = async (branch: TBranch, companyID: string) => {
  await branchRepository.update({ id: branch.id }, branch);
  return findById(branch.id, companyID);
};
