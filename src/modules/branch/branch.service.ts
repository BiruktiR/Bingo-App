import { AppDataSource } from '../../db/data-source';
import { TBranch, TFindBranchSchema } from './branch.schema';
import { Not } from 'typeorm';
import { TCompany } from '../company/company.schema';
import { Branch } from '../../db/entities/branch.entity';
import { Company } from '../../db/entities/company.entity';
import { MetadataType } from '../../config/other-types/metadata';
import { generateMetadata } from '../../config/util-functions/generate-metadata';

const branchRepository = AppDataSource.getRepository(Branch);

export const find = async (filters: TFindBranchSchema) => {
  let branch = await branchRepository
    .createQueryBuilder('branches')
    .leftJoinAndSelect('branches.company', 'company');
  if (filters?.id)
    await branch.andWhere('branches.id=:branchID', { branchID: filters.id });
  if (filters?.name)
    await branch.andWhere('branches.name like :branchName', {
      branchName: `%${filters.name}%`,
    });
  if (filters?.companyID)
    await branch.andWhere('company.id=:companyID', {
      companyID: filters.companyID,
    });
  let page: number = !Number.isNaN(parseInt(filters.page))
    ? parseInt(filters.page)
    : 1;
  let limit: number = !Number.isNaN(parseInt(filters.limit))
    ? parseInt(filters.limit)
    : 20;
  let offset: number = limit * (page - 1);

  await branch.skip(offset).take(limit);
  let count: number = await branch.getCount();

  const metadata: MetadataType = await generateMetadata(page, limit, count);
  return {
    metadata: metadata,
    data: await branch.getMany(),
  };
};
export const findById = async (id: string) => {
  return (
    branchRepository
      .createQueryBuilder('branches')
      .leftJoinAndSelect('branches.company', 'company')
      .where('branches.id=:branchID', { branchID: id })
      // .andWhere('branches.companyId=:companyID', { companyID: companyID })
      .getOne()
  );
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
  return findById(branch.id);
};
