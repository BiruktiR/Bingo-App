export enum ROLES {
  admin = 'ADMIN',
  cashier = 'CASHIER',
  superAdmin = 'SUPERADMIN',
}

export enum activeStatus {
  active = 'Active',
  inactive = 'Inactive',
}
export enum validationType {
  body = 'BODY',
  query = 'QUERY',
}
export enum TOKEN_TYPE {
  access = 'ACCESS',
  refresh = 'REFRESH',
}

export enum GUARD_TYPES {
  superAdmin = 'SUPER_ADMIN',
  superAdminAndAdmin = 'SUPER_ADMIN_AND_ADMIN',
  all = 'ALL',
  adminCashier = 'ADMIN_CASHIER',
}
export enum RANDOM_TYPE {
  raw = 'RAW',
  custom = 'CUSTOM',
}
export enum DATE_TYPE {
  start = 'START',
  end = 'END',
}
export enum LANGUAGES {
  amharic = 'amharic',
  oromiffa = 'oromiffa',
}
export enum TRANSFER_TYPE {
  sender = 'sender',
  receiver = 'receiver',
}
export enum NOTIFICATION_TYPE {
  alert = 'Alert',
  bankTransfer = 'Bank Transfer',
}
