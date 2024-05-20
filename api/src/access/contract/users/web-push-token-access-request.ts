import { WebPushTokenKey } from "./web-push-token-key";

export class WebPushTokenAccessRequest {
  constructor(
    public endpoint: string,
    public expirationTime: Date | null,
    public keys: WebPushTokenKey,
    public email: string
  ) { }
}
