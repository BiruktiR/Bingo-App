import { AppDataSource } from '../db/data-source';
import { TBranch } from '../config/zod-schemas/branch.schema';
import { Not } from 'typeorm';
import { TCompany } from '../config/zod-schemas/company.schema';
import { Branch } from '../db/entities/branch.entity';

const branchRepository = AppDataSource.getRepository(Branch);

export const find = async () => {
  return branchRepository.find();
};
export const findById = async (id: string, companyID: string) => {
  return branchRepository
    .createQueryBuilder('branches')
    .where('branch.id=:branchID', { branchID: id })
    .andWhere('branch.companyId=:companyID', { companyID: companyID })
    .getOne();
};
export const findByName = async (name: string, companyID: string) => {
  return branchRepository.findOne({
    relations: {
      company: true,
    },
    where: {
      name: name,
      company: {
        id: companyID,
      },
    },
  });
};
export const checkDupUpdate = async (branch: TBranch) => {
  return branchRepository
    .createQueryBuilder('branch')
    .where('branch.id!=:branchID', { branchID: branch.id })
    .andWhere('branch.name=:branchName', { branchName: branch.name })
    .getOne();
};
export const save = async (branch: TBranch, company: TCompany) => {
  await branchRepository.save({
    ...branch,
    company: company,
  });
};

export const modify = async (branch: TBranch, companyID: string) => {
  await branchRepository.update({ id: branch.id }, branch);
  return findById(branch.id, companyID);
};
