import { DeleteTagUseCase } from './delete-tag.use-case';
import { ITagRepository } from '../../domain/ports/ITagRepository';

describe('DeleteTagUseCase', () => {
  let useCase: DeleteTagUseCase;
  let repository: jest.Mocked<ITagRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteTagUseCase(repository);
  });

  it('should delete a tag by id', async () => {
    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.delete).toHaveBeenCalledWith('uuid-1');
  });
});
