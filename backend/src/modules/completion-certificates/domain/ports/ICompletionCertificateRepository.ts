import { CompletionCertificate } from '../entities/CompletionCertificate';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface ICompletionCertificateRepository {
  create(data: {
    authorId: string;
    pdfUrl: string;
    serialNumber: string;
  }): Promise<CompletionCertificate>;
  findById(id: string): Promise<CompletionCertificate | null>;
  findByAuthorId(authorId: string): Promise<CompletionCertificate | null>;
  findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CompletionCertificate>>;
}
