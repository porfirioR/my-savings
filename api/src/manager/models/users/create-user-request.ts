export class CreateUserRequest {
  constructor(
    public email: string,
    public password: string,
  ) {}
}