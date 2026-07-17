import { CreateNotificationUseCase } from './create-notification.use-case';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';

describe('CreateNotificationUseCase', () => {
  let useCase: CreateNotificationUseCase;
  let notificationRepository: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    notificationRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
      countUnread: jest.fn(),
    };
    useCase = new CreateNotificationUseCase(notificationRepository);
  });

  it('should create and persist a notification with entityType/entityId', async () => {
    notificationRepository.create.mockResolvedValue(
      new Notification(
        'notif-1',
        'user-1',
        'Hola',
        'Mensaje',
        'INFO',
        'PROJECT',
        'rel-1',
        null,
        new Date(),
      ),
    );

    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Hola',
      message: 'Mensaje',
      type: 'INFO',
      entityType: 'PROJECT',
      entityId: 'rel-1',
    });

    expect(result).toBeInstanceOf(Notification);
    expect(result.entityId).toBe('rel-1');
    expect(result.entityType).toBe('PROJECT');
    expect(result.isRead).toBe(false);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(notificationRepository.create).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(notificationRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        title: 'Hola',
        type: 'INFO',
        entityType: 'PROJECT',
        entityId: 'rel-1',
      }),
    );
  });

  it('should default entityType/entityId to undefined when not provided', async () => {
    notificationRepository.create.mockResolvedValue(
      new Notification(
        'notif-2',
        'user-2',
        'T',
        'M',
        'ALERT',
        null,
        null,
        null,
        new Date(),
      ),
    );

    const result = await useCase.execute({
      userId: 'user-2',
      title: 'T',
      message: 'M',
      type: 'ALERT',
    });

    expect(result.entityType).toBeNull();
    expect(result.entityId).toBeNull();
  });
});
