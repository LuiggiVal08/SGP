import { DeleteTrajectoryUseCase } from './delete-trajectory.use-case';
import { ITrajectoryRepository } from '../../domain/ports/ITrajectoryRepository';

describe('DeleteTrajectoryUseCase', () => {
  let useCase: DeleteTrajectoryUseCase;
  let trajectoryRepository: jest.Mocked<ITrajectoryRepository>;

  beforeEach(() => {
    trajectoryRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteTrajectoryUseCase(trajectoryRepository);
  });

  it('should delete a trajectory by id', async () => {
    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(trajectoryRepository.delete).toHaveBeenCalledWith('uuid-1');
  });
});
