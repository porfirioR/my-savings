export class GeneratePaymentsAccessRequest {
  constructor(
    public ruedaId: string,
    public month: number,
    public year: number,
  ) {}
}
