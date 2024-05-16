import { WebPushTokenKeyModel } from "./web-push-token-key-model";

export class WebPushModel {
  
  constructor(
    public id: number,
    public endpoint: string,
    public expirationTime: Date,
    public keys: WebPushTokenKeyModel
  ) {}
}
