import { CreateUserAccessRequest } from "./create-user-access-request";

export class UpdateUserAccessRequest extends CreateUserAccessRequest {
  constructor(
    public id: number,
    public email: string,
    public dateCreated: Date
  ) {
    super(email)
  }
}
