export class ForgotPasswordRequest {
  constructor(
    public email: string,
    public code: string,
  ) {}
}
