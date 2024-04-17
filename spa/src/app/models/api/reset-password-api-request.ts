export class ResetPasswordApiRequest {
  constructor(
    public email: string,
    public code: string,
    public newPassword: string,
  ) { }
}
