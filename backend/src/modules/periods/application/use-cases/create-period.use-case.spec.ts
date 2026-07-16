import { CreatePeriodUseCase } from './create-period.use-case';
import { IPeriodRepository } from '../../domain/ports/IPeriodRepository';
import { Period } from '../../domain/entities/Period';

describe('CreatePeriodUseCase', () => {
  let useCase: CreatePeriodUseCase;

  let periodRepository: jest.Mocked<IPeriodRepository>;

  beforeEach(() => {
    periodRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreatePeriodUseCase(periodRepository);
  });

  it('should create and persist a period with generated id', async () => {
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-06-15');
    const result = await useCase.execute({
      name: '2024-I',
      startDate,
      endDate,
      isActive: true,
    });

    expect(result).toBeInstanceOf(Period);
    expect(result.id).toBeDefined();
    expect(result.name).toBe('2024-I');
    expect(result.isActive).toBe(true);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(periodRepository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(periodRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ id: result.id, name: '2024-I' }),
    );
  });

  it('should default isActive to true when not provided', async () => {
    const result = await useCase.execute({
      name: '2024-II',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-01'),
    });

    expect(result.isActive).toBe(true);
  });
});
