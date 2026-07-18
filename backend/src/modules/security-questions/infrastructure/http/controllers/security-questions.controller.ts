import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { GetQuestionsUseCase } from '../../../application/use-cases/get-questions.use-case';
import { GetUserQuestionsUseCase } from '../../../application/use-cases/get-user-questions.use-case';
import { SetUserQuestionsUseCase } from '../../../application/use-cases/set-user-questions.use-case';
import { ForgotPasswordInitUseCase } from '../../../../auth/application/use-cases/forgot-password-init.use-case';
import { ForgotPasswordVerifyUseCase } from '../../../../auth/application/use-cases/forgot-password-verify.use-case';
import { ForgotPasswordResetUseCase } from '../../../../auth/application/use-cases/forgot-password-reset.use-case';
import { ChangePasswordUseCase } from '../../../../auth/application/use-cases/change-password.use-case';
import { SetSecurityQuestionsDto } from '../dtos/security-questions.dto';
import {
  ForgotPasswordInitDto,
  ForgotPasswordVerifyDto,
  ForgotPasswordResetDto,
} from '../dtos/forgot-password.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@ApiTags('Security Questions')
@Controller()
export class SecurityQuestionsController {
  constructor(
    private readonly getQuestionsUseCase: GetQuestionsUseCase,
    private readonly getUserQuestionsUseCase: GetUserQuestionsUseCase,
    private readonly setUserQuestionsUseCase: SetUserQuestionsUseCase,
    private readonly forgotPasswordInitUseCase: ForgotPasswordInitUseCase,
    private readonly forgotPasswordVerifyUseCase: ForgotPasswordVerifyUseCase,
    private readonly forgotPasswordResetUseCase: ForgotPasswordResetUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Get('security-questions')
  @ApiOperation({
    summary: 'Listar preguntas de seguridad',
    description: 'Obtiene todas las preguntas de seguridad disponibles',
  })
  async findAll() {
    return this.getQuestionsUseCase.execute();
  }

  @Get('users/me/security-questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Mis preguntas de seguridad',
    description:
      'Obtiene las preguntas de seguridad configuradas por el usuario autenticado',
  })
  async getMyQuestions(@Req() req: { user: JwtPayload }) {
    return this.getUserQuestionsUseCase.execute(req.user.sub);
  }

  @Post('users/me/security-questions')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Configurar preguntas de seguridad',
    description:
      'Guarda o actualiza las 3 preguntas de seguridad del usuario autenticado',
  })
  async setMyQuestions(
    @Req() req: { user: JwtPayload },
    @Body() dto: SetSecurityQuestionsDto,
  ) {
    return this.setUserQuestionsUseCase.execute(req.user.sub, dto.questions);
  }

  @Post('auth/forgot-password/init')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar recuperación de acceso',
    description:
      'Devuelve las preguntas de seguridad del usuario (sin respuestas)',
  })
  async forgotPasswordInit(@Body() dto: ForgotPasswordInitDto) {
    return this.forgotPasswordInitUseCase.execute({
      identifier: dto.identifier,
    });
  }

  @Post('auth/forgot-password/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verificar respuestas de seguridad',
    description: 'Valida las respuestas y emite un token PASSWORD_RESET',
  })
  async forgotPasswordVerify(@Body() dto: ForgotPasswordVerifyDto) {
    return this.forgotPasswordVerifyUseCase.execute({
      identifier: dto.identifier,
      answers: dto.answers,
    });
  }

  @Post('auth/forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer contraseña',
    description:
      'Restablece la contraseña usando un token PASSWORD_RESET válido',
  })
  async forgotPasswordReset(@Body() dto: ForgotPasswordResetDto) {
    await this.forgotPasswordResetUseCase.execute({
      resetToken: dto.resetToken,
      newPassword: dto.newPassword,
    });
    return { message: 'Contraseña restablecida exitosamente' };
  }

  @Post('users/me/change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Cambiar contraseña',
    description: 'Cambia la contraseña del usuario autenticado',
  })
  async changePassword(
    @Req() req: { user: JwtPayload },
    @Body() dto: ChangePasswordDto,
  ) {
    await this.changePasswordUseCase.execute({
      userId: req.user.sub,
      currentPassword: dto.currentPassword,
      newPassword: dto.newPassword,
    });
    return { message: 'Contraseña actualizada exitosamente' };
  }
}
