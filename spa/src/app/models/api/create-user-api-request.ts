import { LoginUserApiRequest } from "./login-user-api-request copy";

export class CreateUserApiRequest extends LoginUserApiRequest {
  constructor(
    email: string,
    password: string
  ) { 
    super(email, password)
  }
}
