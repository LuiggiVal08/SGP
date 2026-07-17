import { GenerateCompletionCertificateUseCase } from './generate-completion-certificate.use-case';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';
import { CompletionCertificate } from '../../domain/entities/CompletionCertificate';

describe('GenerateCompletionCertificateUseCase', () => {
  let useCase: GenerateCompletionCertificateUseCase;
  let certificateRepository: jest.Mocked<ICompletionCertificateRepository>;

  beforeEach(() => {
    certificateRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByAuthorId: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    useCase = new GenerateCompletionCertificateUseCase(certificateRepository);
  });

  it('should throw ConflictException when certificate already exists', async () => {
    certificateRepository.findByAuthorId.mockResolvedValue(
      new CompletionCertificate(
        'cert-1',
        'author-1',
        '/uploads/certificates/CERT-ABC.pdf',
        'CERT-ABC',
        new Date(),
        new Date(),
        new Date(),
      ),
    );

    await expect(useCase.execute('author-1')).rejects.toThrow();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(certificateRepository.create).not.toHaveBeenCalled();
  });

  it('should generate and persist a new certificate', async () => {
    certificateRepository.findByAuthorId.mockResolvedValue(null);
    certificateRepository.create.mockResolvedValue(
      new CompletionCertificate(
        'cert-1',
        'author-1',
        '/uploads/certificates/CERT-ABC.pdf',
        'CERT-ABC',
        new Date(),
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute('author-1');

    expect(result).toBeInstanceOf(CompletionCertificate);
    expect(result.pdfUrl).toMatch(/^\/uploads\/certificates\//);
    expect(result.serialNumber).toMatch(/^CERT-/);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(certificateRepository.create).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(certificateRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        authorId: 'author-1',
        serialNumber: expect.stringMatching(/^CERT-/),
      }),
    );
  });
});
