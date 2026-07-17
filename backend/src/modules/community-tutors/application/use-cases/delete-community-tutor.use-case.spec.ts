import { DeleteCommunityTutorUseCase } from './delete-community-tutor.use-case';
import { ICommunityTutorRepository } from '../../domain/ports/ICommunityTutorRepository';

describe('DeleteCommunityTutorUseCase', () => {
  let useCase: DeleteCommunityTutorUseCase;
  let repository: jest.Mocked<ICommunityTutorRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteCommunityTutorUseCase(repository);
  });

  it('should delete a community tutor by id', async () => {
    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.delete).toHaveBeenCalledWith('uuid-1');
  });
});
