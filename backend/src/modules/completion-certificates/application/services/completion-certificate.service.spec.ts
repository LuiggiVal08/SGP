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
      findByAuthorId: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new CompletionCertificateService(repository);
  });

  describe('generateByAuthorId', () => {
    it('should throw ConflictException when certificate already exists', async () => {
      repository.findByAuthorId.mockResolvedValue(
        new CompletionCertificate(
          'existing',
          'author-1',
          '/url',
          'CERT-EXISTING',
          new Date(),
          new Date(),
          new Date(),
        ),
      );

      await expect(service.generateByAuthorId('author-1')).rejects.toThrow();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('should generate a certificate for a valid author', async () => {
      repository.findByAuthorId.mockResolvedValue(null);
      repository.create.mockResolvedValue(
        new CompletionCertificate(
          'cert-1',
          'author-1',
          '/uploads/certificates/CERT-ABC-DEF.pdf',
          'CERT-ABC-DEF',
          new Date(),
          new Date(),
          new Date(),
        ),
      );

      const result = await service.generateByAuthorId('author-1');

      expect(result).toBeInstanceOf(CompletionCertificate);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findByAuthorId).toHaveBeenCalledWith('author-1');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledTimes(1);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: 'author-1',
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return certificate when found', async () => {
      const cert = new CompletionCertificate(
        'cert-1',
        'author-1',
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
