import { DeleteNotificationUseCase } from './delete-notification.use-case';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';

describe('DeleteNotificationUseCase', () => {
  let useCase: DeleteNotificationUseCase;
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
    useCase = new DeleteNotificationUseCase(notificationRepository);
  });

  it('should throw NotFoundException when notification does not exist', async () => {
    notificationRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(notificationRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete an existing notification', async () => {
    notificationRepository.findById.mockResolvedValue(
      new Notification(
        'notif-1',
        'user-1',
        'T',
        'M',
        'INFO',
        false,
        null,
        new Date(),
      ),
    );

    await useCase.execute('notif-1');

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(notificationRepository.delete).toHaveBeenCalledWith('notif-1');
  });
});
