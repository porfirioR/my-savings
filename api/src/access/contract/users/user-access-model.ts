export class UserAccessModel {
  constructor(
    public id: number,
    public email: string,
    public dateCreated: Date,
    public password: string,
    public code?: string
  ) {}
}