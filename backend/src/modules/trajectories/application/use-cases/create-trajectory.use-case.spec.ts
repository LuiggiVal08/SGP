import { CreateTrajectoryUseCase } from './create-trajectory.use-case';
import { ITrajectoryRepository } from '../../domain/ports/ITrajectoryRepository';
import { Trajectory } from '../../domain/entities/Trajectory';

describe('CreateTrajectoryUseCase', () => {
  let useCase: CreateTrajectoryUseCase;
  let trajectoryRepository: jest.Mocked<ITrajectoryRepository>;

  beforeEach(() => {
    trajectoryRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateTrajectoryUseCase(trajectoryRepository);
  });

  it('should create and persist a trajectory with generated id', async () => {
    const result = await useCase.execute({
      pnfId: 'pnf-1',
      name: 'Trayecto I',
      orderNumber: 1,
    });

    expect(result).toBeInstanceOf(Trajectory);
    expect(result.id).toBeDefined();
    expect(result.pnfId).toBe('pnf-1');
    expect(result.orderNumber).toBe(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(trajectoryRepository.save).toHaveBeenCalledTimes(1);
  });
});
