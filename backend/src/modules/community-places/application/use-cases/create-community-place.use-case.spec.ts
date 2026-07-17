import { CreateCommunityPlaceUseCase } from './create-community-place.use-case';
import { ICommunityPlaceRepository } from '../../domain/ports/ICommunityPlaceRepository';
import { CommunityPlace } from '../../domain/entities/CommunityPlace';

describe('CreateCommunityPlaceUseCase', () => {
  let useCase: CreateCommunityPlaceUseCase;
  let repository: jest.Mocked<ICommunityPlaceRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateCommunityPlaceUseCase(repository);
  });

  it('should create and persist a community place with generated id', async () => {
    const result = await useCase.execute({
      institutionId: 'inst-1',
      name: 'Consejo Comunal El Carmen',
      type: 'COMMUNITY',
    });

    expect(result).toBeInstanceOf(CommunityPlace);
    expect(result.id).toBeDefined();
    expect(result.type).toBe('COMMUNITY');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
