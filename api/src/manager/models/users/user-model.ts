export class UserModel {
  constructor(
    public id: number,
    public email: string,
    public dateCreated: Date,
    public token: string
  ) {}
}