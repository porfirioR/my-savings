import { WebPushTokenKeyApiRequest } from ".";

export interface PushTokenApiRequest {
  endpoint: string,
  expirationTime: Date | null,
  keys: WebPushTokenKeyApiRequest
}