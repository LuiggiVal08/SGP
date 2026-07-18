import { useQuery } from '@tanstack/react-query';
import { certificateService, type CertificateFilters } from '../services/certificate.service';

export const CERTIFICATES_QUERY_KEY = ['certificates'] as const;

export function useCertificates(filters: CertificateFilters = {}) {
  return useQuery({
    queryKey: [...CERTIFICATES_QUERY_KEY, filters],
    queryFn: ({ signal }) => certificateService.list(filters, signal),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCertificate(id: string | undefined) {
  return useQuery({
    queryKey: [...CERTIFICATES_QUERY_KEY, 'detail', id],
    queryFn: ({ signal }) => certificateService.getById(id as string, signal),
    enabled: !!id,
  });
}
