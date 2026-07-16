import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { NotificationService } from '../../application/services/notification.service';

interface JwtPayload {
  sub: string;
}

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({
    summary: 'Get current user notifications',
    description: 'Returns notifications for the authenticated user',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  async findMine(
    @Req() req: { user: JwtPayload },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.notificationService.findByUser(req.user.sub, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search: search || undefined,
    });
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Marks a single notification as read',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async markAsRead(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    await this.notificationService.markAsRead(id, req.user.sub);
    return { success: true };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Marks all notifications for the user as read',
  })
  async markAllAsRead(@Req() req: { user: JwtPayload }) {
    await this.notificationService.markAllAsRead(req.user.sub);
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Deletes a notification',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async delete(@Param('id') id: string, @Req() req: { user: JwtPayload }) {
    await this.notificationService.delete(id, req.user.sub);
    return { success: true };
  }
}
