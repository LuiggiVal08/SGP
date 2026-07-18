import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { env } from '@config/env.config';
import { UsersModule } from '@modules/users/users.module';
import { RolesModule } from '@modules/roles/roles.module';
import { JwtTokenAdapter } from './infrastructure/services/jwt-token.adapter';
import { BcryptHashAdapter } from './infrastructure/services/bcrypt-hash.adapter';
import { LoginUseCase } from './application/use-cases/login-use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { UserSessionModel } from './infrastructure/persistence/sequelize/models/user-session.model';
import { UserTokenModel } from './infrastructure/persistence/sequelize/models/user-token.model';
import { UserSessionSequelizeAdapter } from './infrastructure/persistence/sequelize/user-session-sequelize.adapter';
import { UserTokenSequelizeAdapter } from './infrastructure/persistence/sequelize/user-token-sequelize.adapter';
import { AuthController } from './infrastructure/http/controllers/auth.controller';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    SequelizeModule.forFeature([UserSessionModel, UserTokenModel]),
    JwtModule.register({
      secret: env.JWT_SECRET,
    }),
  ],
  providers: [
    {
      provide: 'ITokenService',
      useClass: JwtTokenAdapter,
    },
    {
      provide: 'IHashService',
      useClass: BcryptHashAdapter,
    },
    {
      provide: 'IUserSessionRepository',
      useClass: UserSessionSequelizeAdapter,
    },
    {
      provide: 'IUserTokenRepository',
      useClass: UserTokenSequelizeAdapter,
    },
    {
      provide: 'ILoginUseCase',
      useClass: LoginUseCase,
    },
    {
      provide: 'IRefreshTokenUseCase',
      useClass: RefreshTokenUseCase,
    },
    {
      provide: 'ILogoutUseCase',
      useClass: LogoutUseCase,
    },
  ],
  controllers: [AuthController],
  exports: ['ITokenService', 'IHashService', 'IUserTokenRepository'],
})
export class AuthModule {}
