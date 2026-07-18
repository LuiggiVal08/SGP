import { AssignTagUseCase } from './assign-tag.use-case';
import { IProjectTagRepository } from '../../domain/ports/IProjectTagRepository';

describe('AssignTagUseCase', () => {
  let useCase: AssignTagUseCase;
  let repository: jest.Mocked<IProjectTagRepository>;

  beforeEach(() => {
    repository = {
      assign: jest.fn(),
      remove: jest.fn(),
      findByProject: jest.fn(),
    };
    useCase = new AssignTagUseCase(repository);
  });

  it('should assign a tag to a project', async () => {
    repository.assign.mockResolvedValue(undefined);

    await useCase.execute('p1', 't1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.assign).toHaveBeenCalledWith('p1', 't1');
  });
});
