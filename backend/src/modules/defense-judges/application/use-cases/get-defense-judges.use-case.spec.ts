import { RemoveJudgeUseCase } from './get-defense-judges.use-case';
import { IDefenseJudgeRepository } from '../../domain/ports/IDefenseJudgeRepository';

describe('RemoveJudgeUseCase', () => {
  let useCase: RemoveJudgeUseCase;
  let defenseJudgeRepository: jest.Mocked<IDefenseJudgeRepository>;

  beforeEach(() => {
    defenseJudgeRepository = {
      findById: jest.fn(),
      findByDefense: jest.fn(),
      countByDefense: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new RemoveJudgeUseCase(defenseJudgeRepository);
  });

  it('should delete a defense judge by id', async () => {
    await useCase.execute('judge-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(defenseJudgeRepository.delete).toHaveBeenCalledWith('judge-1');
  });
});
