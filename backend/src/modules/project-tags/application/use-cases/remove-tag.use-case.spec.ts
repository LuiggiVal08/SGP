import { RemoveTagUseCase } from './remove-tag.use-case';
import { IProjectTagRepository } from '../../domain/ports/IProjectTagRepository';

describe('RemoveTagUseCase', () => {
  let useCase: RemoveTagUseCase;
  let repository: jest.Mocked<IProjectTagRepository>;

  beforeEach(() => {
    repository = {
      assign: jest.fn(),
      remove: jest.fn(),
      findByProject: jest.fn(),
    };
    useCase = new RemoveTagUseCase(repository);
  });

  it('should remove a tag from a project', async () => {
    repository.remove.mockResolvedValue(undefined);

    await useCase.execute('p1', 't1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.remove).toHaveBeenCalledWith('p1', 't1');
  });
});
