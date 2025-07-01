export const DB_NAME = "RAGPDF";

export const UserRolesEnum = {
  ADMIN: "ADMIN",
  COMPANYMEMBER: "COMPANYMEMBER",
  NORMALUSER: "NORMALUSER",
  SUPERADMIN: "SUPERADMIN",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

export const UserLoginType = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
};

export const AvailableSocialLogins = Object.values(UserLoginType);
export const getTenantCollectionName = (companyId) =>
  `ragapp_company_${companyId}`;

export const USER_TEMPORARY_TOKEN_EXPIRY = 10 * 60 * 1000; // 10 minutes
