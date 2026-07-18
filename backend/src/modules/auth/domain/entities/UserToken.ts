export type UserTokenType = 'PASSWORD_RESET' | 'EMAIL_VERIFY' | 'SESSION';

export class UserToken {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly token: string,
    public readonly type: UserTokenType,
    public readonly used: boolean,
    public readonly expiration: Date,
    public readonly createdAt: Date,
  ) {}
}
