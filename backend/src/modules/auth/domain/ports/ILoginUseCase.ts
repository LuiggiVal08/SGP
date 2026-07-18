export interface LoginInput {
  email?: string;
  identifier?: string;
  password: string;
  device?: string | null;
  ip?: string | null;
}

export interface LoginOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

export interface ILoginUseCase {
  execute(input: LoginInput): Promise<LoginOutput>;
}
