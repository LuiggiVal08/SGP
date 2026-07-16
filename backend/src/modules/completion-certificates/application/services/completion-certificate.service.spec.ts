import { CompletionCertificateService } from './completion-certificate.service';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';
import { CompletionCertificate } from '../../domain/entities/CompletionCertificate';

describe('CompletionCertificateService', () => {
  let service: CompletionCertificateService;
  let repository: jest.Mocked<ICompletionCertificateRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findAuthorInfo: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new CompletionCertificateService(repository);
  });

  describe('generateByAuthorId', () => {
    it('should generate a certificate for a valid author', async () => {
      repository.findAuthorInfo.mockResolvedValue({
        projectId: 'proj-1',
        userId: 'user-1',
        projectTitle: 'Test Project',
        projectYear: 2025,
        studentName: 'John Doe',
        studentEmail: 'john@test.com',
        tutorName: 'Jane Smith',
        pnfName: 'Ingeniería',
      });
      repository.findByUserId.mockResolvedValue(null);
      repository.create.mockResolvedValue(
        new CompletionCertificate(
          'cert-1',
          'proj-1',
          'user-1',
          '/uploads/certificates/CERT-2025-ABC-DEF.pdf',
          'CERT-2025-ABC-DEF',
          new Date(),
          new Date(),
          new Date(),
        ),
      );

      const result = await service.generateByAuthorId('user-1');

      expect(result).toBeInstanceOf(CompletionCertificate);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findAuthorInfo).toHaveBeenCalledWith('user-1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'proj-1',
          userId: 'user-1',
        }),
      );
    });

    it('should throw NotFoundException when author is not found', async () => {
      repository.findAuthorInfo.mockResolvedValue(null);

      await expect(service.generateByAuthorId('unknown')).rejects.toThrow(
        'Author not found',
      );
    });

    it('should throw ConflictException when certificate already exists', async () => {
      repository.findAuthorInfo.mockResolvedValue({
        projectId: 'proj-1',
        userId: 'user-1',
        projectTitle: 'Test',
        projectYear: 2025,
        studentName: 'John',
        studentEmail: 'john@test.com',
        tutorName: 'Jane',
        pnfName: 'PNF',
      });
      repository.findByUserId.mockResolvedValue(
        new CompletionCertificate(
          'existing',
          'proj-1',
          'user-1',
          '/url',
          'CERT-EXISTING',
          new Date(),
          new Date(),
          new Date(),
        ),
      );

      await expect(service.generateByAuthorId('user-1')).rejects.toThrow(
        'Certificate already exists',
      );
    });
  });

  describe('findById', () => {
    it('should return certificate when found', async () => {
      const cert = new CompletionCertificate(
        'cert-1',
        'proj-1',
        'user-1',
        '/url',
        'CERT-1',
        new Date(),
        new Date(),
        new Date(),
      );
      repository.findById.mockResolvedValue(cert);

      const result = await service.findById('cert-1');
      expect(result).toBe(cert);
    });

    it('should throw NotFoundException when not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('missing')).rejects.toThrow(
        'Certificate not found',
      );
    });
  });
});
