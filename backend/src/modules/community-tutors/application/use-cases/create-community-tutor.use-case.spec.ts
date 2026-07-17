import { CreateCommunityTutorUseCase } from './create-community-tutor.use-case';
import { ICommunityTutorRepository } from '../../domain/ports/ICommunityTutorRepository';
import { CommunityTutor } from '../../domain/entities/CommunityTutor';

describe('CreateCommunityTutorUseCase', () => {
  let useCase: CreateCommunityTutorUseCase;
  let repository: jest.Mocked<ICommunityTutorRepository>;

  beforeEach(() => {
    repository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateCommunityTutorUseCase(repository);
  });

  it('should create and persist a community tutor with generated id', async () => {
    const result = await useCase.execute({
      locationId: 'place-1',
      fullName: 'Ana Pérez',
      position: 'Coordinadora',
    });

    expect(result).toBeInstanceOf(CommunityTutor);
    expect(result.id).toBeDefined();
    expect(result.locationId).toBe('place-1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repository.save).toHaveBeenCalledTimes(1);
  });
});
