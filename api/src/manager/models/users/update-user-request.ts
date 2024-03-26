
export class UpdateUserRequest {
  constructor(
    public id: number,
    public email: string,
    public dateCreated: Date
  ) { }
}
