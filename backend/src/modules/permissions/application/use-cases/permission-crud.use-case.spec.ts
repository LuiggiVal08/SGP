import {
  CreatePermissionUseCase,
  UpdatePermissionUseCase,
  DeletePermissionUseCase,
  GetPermissionUseCase,
  ListPermissionsUseCase,
} from './permission-crud.use-case';
import { IPermissionRepository } from '../../domain/ports/IPermissionRepository';
import { Permission } from '../../domain/entities/Permission';

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase;
  let repo: jest.Mocked<IPermissionRepository>;

  beforeEach(() => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreatePermissionUseCase(repo);
  });

  it('creates a permission when name is free', async () => {
    repo.findByName.mockResolvedValue(null);
    repo.create.mockResolvedValue(new Permission('p1', 'user.read', null));
    const result = await useCase.execute({ name: 'user.read' });
    expect(result.name).toBe('user.read');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.create).toHaveBeenCalledWith({
      name: 'user.read',
      description: undefined,
    });
  });

  it('throws when name exists', async () => {
    repo.findByName.mockResolvedValue(new Permission('p1', 'user.read', null));
    await expect(useCase.execute({ name: 'user.read' })).rejects.toThrow();
  });
});

describe('UpdatePermissionUseCase', () => {
  let useCase: UpdatePermissionUseCase;
  let repo: jest.Mocked<IPermissionRepository>;
  const make = () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new UpdatePermissionUseCase(repo);
  };

  it('updates when found', async () => {
    make();
    repo.findById.mockResolvedValue(new Permission('p1', 'user.read', null));
    repo.update.mockResolvedValue(new Permission('p1', 'user.write', 'd'));
    const r = await useCase.execute('p1', { name: 'user.write' });
    expect(r.name).toBe('user.write');
  });

  it('throws when not found', async () => {
    make();
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('p1', {})).rejects.toThrow();
  });

  it('throws on name clash', async () => {
    make();
    repo.findById.mockResolvedValue(new Permission('p1', 'user.read', null));
    repo.findByName.mockResolvedValue(new Permission('p2', 'user.write', null));
    await expect(
      useCase.execute('p1', { name: 'user.write' }),
    ).rejects.toThrow();
  });
});

describe('DeletePermissionUseCase', () => {
  let useCase: DeletePermissionUseCase;
  let repo: jest.Mocked<IPermissionRepository>;
  const make = () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeletePermissionUseCase(repo);
  };

  it('deletes when found', async () => {
    make();
    repo.findById.mockResolvedValue(new Permission('p1', 'user.read', null));
    await useCase.execute('p1');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.delete).toHaveBeenCalledWith('p1');
  });

  it('throws when not found', async () => {
    make();
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('p1')).rejects.toThrow();
  });
});

describe('GetPermissionUseCase', () => {
  let useCase: GetPermissionUseCase;
  let repo: jest.Mocked<IPermissionRepository>;
  const make = () => {
    repo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new GetPermissionUseCase(repo);
  };

  it('returns permission', async () => {
    make();
    repo.findById.mockResolvedValue(new Permission('p1', 'user.read', null));
    const r = await useCase.execute('p1');
    expect(r.id).toBe('p1');
  });

  it('throws when missing', async () => {
    make();
    repo.findById.mockResolvedValue(null);
    await expect(useCase.execute('p1')).rejects.toThrow();
  });
});

describe('ListPermissionsUseCase', () => {
  it('returns all', async () => {
    const repo: jest.Mocked<IPermissionRepository> = {
      findAll: jest.fn().mockResolvedValue([new Permission('p1', 'a', null)]),
      findById: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    const useCase = new ListPermissionsUseCase(repo);
    const r = await useCase.execute();
    expect(r).toHaveLength(1);
  });
});
