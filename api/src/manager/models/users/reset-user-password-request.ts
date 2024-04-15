export class ResetUserPasswordRequest {
  constructor(
    public email: string,
    public password: string,
    public code: string
  ) {}
}
