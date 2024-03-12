export class CreateUserApiRequest {
  constructor(
    public email: string,
    public password: string
  ) { }
}
