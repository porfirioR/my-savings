import { WebPushTokenKeyModel } from ".";

export class WebPushRequest {
  constructor(
    public endpoint: string,
    public expirationTime: Date | null,
    public keys: WebPushTokenKeyModel,
    public email: string
  ) {}
}
