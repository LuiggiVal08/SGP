export const ADMIN_ROLES = ['ADMIN', 'IRCOP'] as const;

export function isAdmin(role: string | undefined): boolean {
  return role ? (ADMIN_ROLES as readonly string[]).includes(role) : false;
}

export function isStudent(role: string | undefined): boolean {
  return role === 'STUDENT';
}
