import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../auth/infrastructure/http/guards/jwt-auth.guard';
import { GetQuestionsUseCase } from '../../../application/use-cases/get-questions.use-case';
import { GetUserQuestionsUseCase } from '../../../application/use-cases/get-user-questions.use-case';
import { SetUserQuestionsUseCase } from '../../../application/use-cases/set-user-questions.use-case';
import { SetSecurityQuestionsDto } from '../dtos/security-questions.dto';

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
}
