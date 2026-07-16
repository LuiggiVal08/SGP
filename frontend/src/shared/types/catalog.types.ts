export interface Pnf {
  id: string;
  name: string;
  institutionId: string;
}

export interface Institution {
  id: string;
  name: string;
  acronym: string;
  email: string;
  contactInfo: string;
}

export interface CatalogUser {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roleId: string;
  roleName: string;
  pnfId: string;
  institutionId: string;
  phone?: string;
}
