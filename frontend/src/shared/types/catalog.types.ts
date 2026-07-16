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

export interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Trajectory {
  id: string;
  pnfId: string;
  name: string;
  orderNumber: number;
}

export interface Subject {
  id: string;
  trajectoryId: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
  category: string;
}

export interface CommunityPlace {
  id: string;
  institutionId: string;
  name: string;
  type: string;
  description: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
}

export interface CommunityTutor {
  id: string;
  locationId: string;
  fullName: string | null;
  dni: string | null;
  phone: string | null;
  email: string | null;
  position: string | null;
}
