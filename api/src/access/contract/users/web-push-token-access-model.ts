import { WebPushTokenAccessRequest } from "./web-push-token-access-request";
import { WebPushTokenKey } from "./web-push-token-key";

export class WebPushTokenAccessModel extends WebPushTokenAccessRequest {
  constructor(
    public id: number,
    endpoint: string,
    expirationTime: Date,
    keys: WebPushTokenKey,
    email: string
  ) {
    super(endpoint, expirationTime, keys, email);
  }
}
