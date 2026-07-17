import { DeleteSubjectUseCase } from './delete-subject.use-case';
import { ISubjectRepository } from '../../domain/ports/ISubjectRepository';

describe('DeleteSubjectUseCase', () => {
  let useCase: DeleteSubjectUseCase;
  let subjectRepository: jest.Mocked<ISubjectRepository>;

  beforeEach(() => {
    subjectRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteSubjectUseCase(subjectRepository);
  });

  it('should delete a subject by id', async () => {
    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(subjectRepository.delete).toHaveBeenCalledWith('uuid-1');
  });
});
