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

const LOOP_MD = `# SGP — Loop State

## Backlog (épicas A–J)

### Épica A — Acceso y seguridad (Auth & RBAC)
- [ ] **A1** Login y sesión — PENDIENTE (dep: P4 registro)
- [x] **A2** Recuperación por preguntas de seguridad — HECHO

### Épica D — Asignaciones, proyectos y tutores
- [ ] **D3** Tutores académicos (regla imparte≠tutor) — PENDIENTE ⚠️ regla dura

### loop/C2 — 2026-07-16
- halt_reason: GREEN
- tests_before: 40/50
- tests_after: 48/50
- cost: 1200
- commit: abc123
- checker: adversarial-review OK
- escalado: PR #7
`;

describe('LoopService', () => {
  let service: LoopService;

  beforeEach(() => {
    service = new LoopService();
    jest.clearAllMocks();
    mockedExists.mockImplementation((p: string) =>
      p.toString().includes('LOOP.md'),
    );
    mockedRead.mockReturnValue(LOOP_MD);
  });

  it('parsea el backlog con estado y reglas duras', () => {
    const snap = service.getSnapshot();
    expect(snap.backlog).toHaveLength(3);
    const a1 = snap.backlog.find((s) => s.id === 'A1');
    expect(a1?.status).toBe('PENDIENTE');
    const a2 = snap.backlog.find((s) => s.id === 'A2');
    expect(a2?.status).toBe('HECHO');
    const d3 = snap.backlog.find((s) => s.id === 'D3');
    expect(d3?.hardRule).toBe(true);
  });

  it('parsea recibos de ciclos', () => {
    const snap = service.getSnapshot();
    expect(snap.receipts).toHaveLength(1);
    expect(snap.receipts[0].story).toBe('C2');
    expect(snap.receipts[0].haltReason).toBe('GREEN');
    expect(snap.receipts[0].testsBefore).toBe('40/50');
    expect(snap.receipts[0].testsAfter).toBe('48/50');
  });

  it('retorna estado null si no hay .loop_state.json', () => {
    expect(service.getState()).toBeNull();
  });
});
