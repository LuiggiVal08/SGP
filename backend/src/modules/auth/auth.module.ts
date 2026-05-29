import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { env } from '@config/env.config';
import { UsersModule } from '@modules/users/users.module';
import { RolesModule } from '@modules/roles/roles.module';
import { JwtTokenAdapter } from './infrastructure/services/jwt-token.adapter';
import { BcryptHashAdapter } from './infrastructure/services/bcrypt-hash.adapter';
import { LoginUseCase } from './application/use-cases/login-use-case';
import { AuthController } from './infrastructure/http/controllers/auth.controller';

@Module({
  imports: [
    UsersModule,
    RolesModule,
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
      provide: 'ILoginUseCase',
      useClass: LoginUseCase,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
