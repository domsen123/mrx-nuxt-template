import type { H3Event } from 'h3'
import type { auth } from '~~/server/utils/auth'

type User = typeof auth.$Infer.Session.user

export interface AuthenticatedH3Event extends H3Event {
  context: H3Event['context'] & {
    user: User
  }
}
