import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { Roles } from '../../../../auth/infrastructure/http/guards/roles.decorator';
import { RolesGuard } from '../../../../auth/infrastructure/http/guards/roles.guard';
import { LogActivity } from '../../../../activity-log/infrastructure/http/log-activity.decorator';
import { CreateNotificationUseCase } from '../../../application/use-cases/create-notification.use-case';
import { GetUserNotificationsUseCase } from '../../../application/use-cases/get-user-notifications.use-case';
import { MarkAsReadUseCase } from '../../../application/use-cases/mark-as-read.use-case';
import { MarkAllAsReadUseCase } from '../../../application/use-cases/mark-all-as-read.use-case';
import { DeleteNotificationUseCase } from '../../../application/use-cases/delete-notification.use-case';
import { PaginationDto } from '@share/application/dtos/pagination.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly getUserNotificationsUseCase: GetUserNotificationsUseCase,
    private readonly markAsReadUseCase: MarkAsReadUseCase,
    private readonly markAllAsReadUseCase: MarkAllAsReadUseCase,
    private readonly deleteNotificationUseCase: DeleteNotificationUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @LogActivity('CREATE', 'NOTIFICATION')
  @ApiOperation({ summary: 'Crear notificación para un usuario' })
  async create(
    @Body()
    body: {
      userId: string;
      title: string;
      message: string;
      type: string;
      relatedId?: string | null;
    },
  ) {
    return this.createNotificationUseCase.execute(body);
  }

  @Get('users/me/notifications')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mis notificaciones' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por READ/UNREAD',
  })
  getMine(
    @Req() req: { user: JwtPayload },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const dto: PaginationDto = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search || undefined,
      status: status || undefined,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.getUserNotificationsUseCase.execute(req.user.sub, dto);
  }

  @Patch('users/me/notifications/:id/read')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  async markRead(@Param('id') id: string) {
    await this.markAsReadUseCase.execute(id);
    return { success: true };
  }

  @Patch('users/me/notifications/read-all')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Marcar todas mis notificaciones como leídas' })
  async markAllRead(@Req() req: { user: JwtPayload }) {
    await this.markAllAsReadUseCase.execute(req.user.sub);
    return { success: true };
  }

  @Delete('users/me/notifications/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Eliminar una notificación' })
  async remove(@Param('id') id: string) {
    await this.deleteNotificationUseCase.execute(id);
    return { success: true };
  }
}
