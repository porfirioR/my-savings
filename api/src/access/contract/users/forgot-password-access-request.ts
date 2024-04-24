export class ForgotPasswordAccessRequest {
  constructor(
    public email: string,
    public code: string
  ) {}
}
