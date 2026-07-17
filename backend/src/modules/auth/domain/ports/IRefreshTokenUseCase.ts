import type { LoginOutput } from './ILoginUseCase';

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface IRefreshTokenUseCase {
  execute(input: RefreshTokenInput): Promise<LoginOutput>;
}
