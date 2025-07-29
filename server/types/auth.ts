import type { User } from 'better-auth'
import type { H3Event } from 'h3'

export interface AuthenticatedH3Event extends H3Event {
  context: H3Event['context'] & {
    user: User
  }
}
