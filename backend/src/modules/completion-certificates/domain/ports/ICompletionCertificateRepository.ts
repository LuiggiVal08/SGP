import { CompletionCertificate } from '../entities/CompletionCertificate';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface ICompletionCertificateRepository {
  save(certificate: CompletionCertificate): Promise<void>;
  findById(id: string): Promise<CompletionCertificate | null>;
  findByAuthor(authorId: string): Promise<CompletionCertificate | null>;
  delete(id: string): Promise<void>;
  findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CompletionCertificate>>;
}
