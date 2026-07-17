import { formatIncompletePhoneNumber } from 'libphonenumber-js';

export function formatDni(dni: string): string {
  const digits = dni.replace(/\D/g, '');
  if (!digits.length) return '';
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function applyPhoneMask(value: string): string {
  const d = value.replace(/\D/g, '');
  if (!d.length) return '';
  try {
    return formatIncompletePhoneNumber(`+${d}`);
  } catch {
    if (d.length <= 3) return `+${d}`;
    return `+${d.slice(0, 3)} ${d.slice(3)}`;
  }
}

export function stripFormatting(value: string): string {
  return value.replace(/\D/g, '');
}
