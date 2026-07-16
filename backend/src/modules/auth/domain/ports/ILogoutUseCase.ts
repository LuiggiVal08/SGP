export interface ILogoutUseCase {
  execute(refreshToken: string): Promise<{ message: string }>;
}
