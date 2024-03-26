export class CreateUserAccessRequest {
  constructor(
    public email: string,
    public password: string
  ) {}
}