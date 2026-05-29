import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService, TokenPayload } from '../../domain/ports/ITokenService';

@Injectable()
export class JwtTokenAdapter implements ITokenService {
  constructor(private readonly jwtService: JwtService) {}

  generate(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token);
  }
}
