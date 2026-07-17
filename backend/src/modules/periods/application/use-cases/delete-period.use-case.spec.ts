import { DeletePeriodUseCase } from './delete-period.use-case';
import { IPeriodRepository } from '../../domain/ports/IPeriodRepository';

describe('DeletePeriodUseCase', () => {
  let useCase: DeletePeriodUseCase;

  let periodRepository: jest.Mocked<IPeriodRepository>;

  beforeEach(() => {
    periodRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeletePeriodUseCase(periodRepository);
  });

  it('should delete a period by id', async () => {
    await useCase.execute('uuid-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(periodRepository.delete).toHaveBeenCalledWith('uuid-1');
  });
});
