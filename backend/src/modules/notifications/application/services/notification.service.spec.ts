import { NotificationService } from './notification.service';
import { INotificationRepository } from '../../domain/ports/INotificationRepository';
import { Notification } from '../../domain/entities/Notification';

describe('NotificationService', () => {
  let service: NotificationService;
  let repository: jest.Mocked<INotificationRepository>;

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      markAsRead: jest.fn(),
      markAllAsRead: jest.fn(),
      delete: jest.fn(),
      countUnread: jest.fn(),
    };
    service = new NotificationService(repository);
  });

  describe('create', () => {
    it('should create a notification', async () => {
      const notification = new Notification(
        'n-1',
        'user-1',
        'Test Title',
        'Test message',
        'PROJECT_STATUS_CHANGE',
        'PROJECT',
        'proj-1',
        null,
        new Date(),
      );
      repository.create.mockResolvedValue(notification);

      const result = await service.create({
        userId: 'user-1',
        title: 'Test Title',
        message: 'Test message',
        type: 'PROJECT_STATUS_CHANGE',
        entityType: 'PROJECT',
        entityId: 'proj-1',
      });

      expect(result).toBe(notification);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.create).toHaveBeenCalledWith({
        userId: 'user-1',
        title: 'Test Title',
        message: 'Test message',
        type: 'PROJECT_STATUS_CHANGE',
        entityType: 'PROJECT',
        entityId: 'proj-1',
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark own notification as read', async () => {
      const notification = new Notification(
        'n-1',
        'user-1',
        'Title',
        'Msg',
        'TYPE',
        null,
        null,
        null,
        new Date(),
      );
      repository.findById.mockResolvedValue(notification);
      repository.markAsRead.mockResolvedValue();

      await service.markAsRead('n-1', 'user-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.markAsRead).toHaveBeenCalledWith('n-1');
    });

    it('should throw ForbiddenException for other users notification', async () => {
      const notification = new Notification(
        'n-1',
        'user-2',
        'Title',
        'Msg',
        'TYPE',
        null,
        null,
        null,
        new Date(),
      );
      repository.findById.mockResolvedValue(notification);

      await expect(service.markAsRead('n-1', 'user-1')).rejects.toThrow(
        'Access denied',
      );
    });

    it('should throw NotFoundException when notification not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.markAsRead('missing', 'user-1')).rejects.toThrow(
        'Notification not found',
      );
    });
  });

  describe('delete', () => {
    it('should delete own notification', async () => {
      const notification = new Notification(
        'n-1',
        'user-1',
        'Title',
        'Msg',
        'TYPE',
        null,
        null,
        null,
        new Date(),
      );
      repository.findById.mockResolvedValue(notification);
      repository.delete.mockResolvedValue();

      await service.delete('n-1', 'user-1');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.delete).toHaveBeenCalledWith('n-1');
    });

    it('should throw ForbiddenException when deleting others notification', async () => {
      const notification = new Notification(
        'n-1',
        'user-2',
        'Title',
        'Msg',
        'TYPE',
        null,
        null,
        null,
        new Date(),
      );
      repository.findById.mockResolvedValue(notification);

      await expect(service.delete('n-1', 'user-1')).rejects.toThrow(
        'Access denied',
      );
    });
  });

  describe('findByUser', () => {
    it('should return notifications and unread count', async () => {
      repository.findByUserId.mockResolvedValue({
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });
      repository.countUnread.mockResolvedValue(3);

      const result = await service.findByUser('user-1', { page: 1, limit: 10 });

      expect(result.unreadCount).toBe(3);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findByUserId).toHaveBeenCalledWith('user-1', {
        page: 1,
        limit: 10,
      });
    });
  });
});
