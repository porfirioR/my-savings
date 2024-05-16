export interface WebPushTokenEntity {
  id: number
  endpoint: string
  expirationTime: Date | null,
  keys: string
}
