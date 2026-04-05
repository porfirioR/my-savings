export class GeneratePaymentsRequest {
  constructor(
    public ruedaId: string,
    public month: number,
    public year: number,
  ) {}
}
