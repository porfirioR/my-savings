export interface CreateEventApiRequest {
  name: string
  authorId: number
  description: string
  date: Date
  isPublic: boolean
}
