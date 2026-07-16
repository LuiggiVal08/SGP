import { CreateNotificationUseCase } from './create-notification.use-case';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';

describe('CreateNotificationUseCase', () => {
  let useCase: CreateNotificationUseCase;
  let notificationRepository: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    notificationRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUser: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new CreateNotificationUseCase(notificationRepository);
  });

  it('should create and persist a notification with generated id and defaults', async () => {
    const result = await useCase.execute({
      userId: 'user-1',
      title: 'Hola',
      message: 'Mensaje',
      type: 'INFO',
      relatedId: 'rel-1',
    });

    expect(result).toBeInstanceOf(Notification);
    expect(result.id).toBeDefined();
    expect(result.read).toBe(false);
    expect(result.relatedId).toBe('rel-1');
    expect(result.createdAt).toBeInstanceOf(Date);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(notificationRepository.save).toHaveBeenCalledTimes(1);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(notificationRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        title: 'Hola',
        type: 'INFO',
        read: false,
      }),
    );
  });

  it('should default relatedId to null when not provided', async () => {
    const result = await useCase.execute({
      userId: 'user-2',
      title: 'T',
      message: 'M',
      type: 'ALERT',
    });

    expect(result.relatedId).toBeNull();
  });
});
