export interface Career {
  id: string;
  name: string;
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
  careerId: string;
  institutionId: string;
}
