import { DeleteCommunityPlaceUseCase } from './delete-community-place.use-case';
import { ICommunityPlaceRepository } from '../../domain/ports/ICommunityPlaceRepository';

describe('DeleteCommunityPlaceUseCase', () => {
  let useCase: DeleteCommunityPlaceUseCase;
  let repository: jest.Mocked<ICommunityPlaceRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteCommunityPlaceUseCase(repository);
  });

  it('should delete a community place by id', async () => {
    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.delete).toHaveBeenCalledWith('uuid-1');
  });
});
