
export class UpdateUserAccessRequest {
  constructor(
    public id: number,
    public email: string,
    public dateCreated: Date
  ) { }
}
