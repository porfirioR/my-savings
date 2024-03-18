export class UserModel {
  constructor(
    public id: number,
    public email: string,
    public passwordHash: string
  ) { }
}