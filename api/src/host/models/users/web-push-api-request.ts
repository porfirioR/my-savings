import { WebPushTokenKeyApiRequest } from "./web-push-token-key-api-request";

export interface WebPushApiRequest {
  endpoint: string
  expirationTime: Date | null
  keys: WebPushTokenKeyApiRequest
  email: string
}
