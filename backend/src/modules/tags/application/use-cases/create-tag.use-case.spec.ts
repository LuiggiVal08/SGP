import { CreateTagUseCase } from './create-tag.use-case';
import { ITagRepository } from '../../domain/ports/ITagRepository';
import { Tag } from '../../domain/entities/Tag';

describe('CreateTagUseCase', () => {
  let useCase: CreateTagUseCase;
  let repository: jest.Mocked<ITagRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateTagUseCase(repository);
  });

  it('should create and persist a tag with generated id', async () => {
    const result = await useCase.execute({
      name: 'Inteligencia Artificial',
      category: 'TECNOLOGIA',
    });

    expect(result).toBeInstanceOf(Tag);
    expect(result.id).toBeDefined();
    expect(result.category).toBe('TECNOLOGIA');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
