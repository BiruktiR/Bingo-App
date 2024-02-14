export enum ROLES {
  admin = 'ADMIN',
  cashier = 'CASHIER',
  superAdmin = 'SUPERADMIN',
}

export enum activeStatus {
  active = 'Active',
  inactive = 'Inactive',
}

export enum TOKEN_TYPE {
  access = 'ACCESS',
  refresh = 'REFRESH',
}

export enum GUARD_TYPES {
  superAdmin = 'SUPER_ADMIN',
  superAdminAndAdmin = 'SUPER_ADMIN_AND_ADMIN',
  all = 'ALL',
}
