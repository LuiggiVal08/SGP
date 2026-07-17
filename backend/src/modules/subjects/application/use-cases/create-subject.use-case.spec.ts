import { CreateSubjectUseCase } from './create-subject.use-case';
import { ISubjectRepository } from '../../domain/ports/ISubjectRepository';
import { Subject } from '../../domain/entities/Subject';

describe('CreateSubjectUseCase', () => {
  let useCase: CreateSubjectUseCase;
  let subjectRepository: jest.Mocked<ISubjectRepository>;

  beforeEach(() => {
    subjectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateSubjectUseCase(subjectRepository);
  });

  it('should create and persist a subject with generated id', async () => {
    const result = await useCase.execute({
      trajectoryId: 'tray-1',
      name: 'Programación I',
    });

    expect(result).toBeInstanceOf(Subject);
    expect(result.id).toBeDefined();
    expect(result.trajectoryId).toBe('tray-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(subjectRepository.save).toHaveBeenCalledTimes(1);
  });
});
