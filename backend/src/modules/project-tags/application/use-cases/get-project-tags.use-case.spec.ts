import { GetProjectTagsUseCase } from './get-project-tags.use-case';
import { IProjectTagRepository } from '../../domain/ports/IProjectTagRepository';

describe('GetProjectTagsUseCase', () => {
  let useCase: GetProjectTagsUseCase;
  let repository: jest.Mocked<IProjectTagRepository>;

  const tags = [{ id: 't1', name: 'IA', category: 'TECNOLOGIA' }];

  beforeEach(() => {
    repository = {
      assign: jest.fn(),
      remove: jest.fn(),
      findByProject: jest.fn(),
    };
    useCase = new GetProjectTagsUseCase(repository);
  });

  it('should return tags for the project', async () => {
    repository.findByProject.mockResolvedValue(tags);

    const result = await useCase.execute('p1');

    expect(result).toEqual(tags);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.findByProject).toHaveBeenCalledWith('p1');
  });
});
