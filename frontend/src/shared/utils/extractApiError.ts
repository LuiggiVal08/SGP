export function extractApiError(err: unknown, fallback = 'Error inesperado'): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
    fallback
  );
}
