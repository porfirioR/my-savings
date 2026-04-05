export class MemberModel {
  constructor(
    public id: string,
    public groupId: string,
    public firstName: string,
    public lastName: string,
    public phone: string | null,
    public position: number,
    public isActive: boolean,
    public joinedMonth: number,
    public joinedYear: number,
    public leftMonth: number | null,
    public leftYear: number | null,
    public createdAt: string,
    public updatedAt: string,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
