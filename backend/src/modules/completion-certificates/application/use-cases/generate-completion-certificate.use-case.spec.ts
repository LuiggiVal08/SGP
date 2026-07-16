import { GenerateCompletionCertificateUseCase } from './generate-completion-certificate.use-case';
import { ICompletionCertificateRepository } from '../../domain/ports/ICompletionCertificateRepository';
import { IUserRepository } from '@modules/users/domain/ports/IUserRepository';
import { IFileStorageService } from '@share/domain/ports/IFileStorageService';
import { CompletionCertificate } from '../../domain/entities/CompletionCertificate';

describe('GenerateCompletionCertificateUseCase', () => {
  let useCase: GenerateCompletionCertificateUseCase;
  let certificateRepository: jest.Mocked<ICompletionCertificateRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let storageService: jest.Mocked<IFileStorageService>;

  const mockUser = {
    id: 'user-1',
    dni: '123',
    firstName: 'Ana',
    lastName: 'Perez',
    email: 'ana@test.com',
    password: 'x',
    isActive: true,
    pnfId: 'pnf-1',
    institutionId: 'inst-1',
    roleId: 'role-1',
  } as any;

  beforeEach(() => {
    certificateRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByAuthor: jest.fn(),
      findAllPaginated: jest.fn(),
      delete: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      countByInstitutionId: jest.fn(),
      countByPnfId: jest.fn(),
      delete: jest.fn(),
    } as any;
    storageService = {
      upload: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GenerateCompletionCertificateUseCase(
      certificateRepository,
      userRepository,
      { generate: jest.fn().mockResolvedValue(Buffer.from('pdf')) } as any,
      storageService,
    );
  });

  it('should return existing certificate if already generated', async () => {
    const existing = new CompletionCertificate(
      'cert-1',
      'user-1',
      new Date(),
      'http://x/pdf',
      'CERT-ABC',
    );
    certificateRepository.findByAuthor.mockResolvedValue(existing);

    const result = await useCase.execute('user-1');

    expect(result).toBe(existing);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(certificateRepository.save).not.toHaveBeenCalled();
  });

  it('should generate and persist a new certificate', async () => {
    userRepository.findById.mockResolvedValue(mockUser);
    certificateRepository.findByAuthor.mockResolvedValue(null);
    storageService.upload.mockResolvedValue({
      key: 'k',
      url: 'http://x/cert.pdf',
    });

    const result = await useCase.execute('user-1');

    expect(result).toBeInstanceOf(CompletionCertificate);
    expect(result.pdfUrl).toBe('http://x/cert.pdf');
    expect(result.code).toMatch(/^CERT-/);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(certificateRepository.save).toHaveBeenCalledTimes(1);
  });
});
