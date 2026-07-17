import { LoopService } from './loop.service';
import { readFileSync, existsSync } from 'node:fs';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('node:fs', () => ({
  ...jest.requireActual('node:fs'),
  existsSync: jest.fn(),
  readFileSync: jest.fn((): string => ''),
}));

const mockedExists = existsSync as jest.MockedFunction<typeof existsSync>;
const mockedRead = readFileSync as jest.MockedFunction<typeof readFileSync>;

describe('LoopService (health)', () => {
  let service: LoopService;

  beforeEach(() => {
    service = new LoopService();
    jest.clearAllMocks();
    mockedExists.mockImplementation((p: string) =>
      p.toString().includes('LOOP.md'),
    );
    mockedRead.mockReturnValue('');
  });

  it('getSnapshot no lanza con LOOP.md vacío', () => {
    const snap = service.getSnapshot();
    expect(snap.backlog).toEqual([]);
    expect(snap.receipts).toEqual([]);
  });
});
