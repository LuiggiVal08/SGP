import { CompletionCertificate } from '../entities/CompletionCertificate';
import type {
  PaginationDto,
  PaginatedResult,
} from '@share/application/dtos/pagination.dto';

export interface AuthorInfo {
  projectId: string;
  userId: string;
  projectTitle: string;
  projectYear: number;
  studentName: string;
  studentEmail: string;
  tutorName: string;
  pnfName: string;
}

export interface ICompletionCertificateRepository {
  create(data: {
    projectId: string;
    userId: string;
    pdfUrl: string;
    serialNumber: string;
  }): Promise<CompletionCertificate>;
  findById(id: string): Promise<CompletionCertificate | null>;
  findByUserId(userId: string): Promise<CompletionCertificate | null>;
  findAuthorInfo(userId: string): Promise<AuthorInfo | null>;
  findAllPaginated(
    dto: PaginationDto,
  ): Promise<PaginatedResult<CompletionCertificate>>;
}
