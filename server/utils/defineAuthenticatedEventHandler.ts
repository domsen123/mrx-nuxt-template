import type { EventHandler, EventHandlerRequest } from 'h3'
import type { AuthenticatedH3Event } from '../types/auth'
import { isAuthenticated } from '../guards/is-authenticated'

export function defineAuthenticatedEventHandler<
  Request extends EventHandlerRequest = EventHandlerRequest,
  D = any,
>(
  handler: ((event: AuthenticatedH3Event) => D | Promise<D>) | {
    onRequest?: EventHandler[]
    handler: (event: AuthenticatedH3Event) => D | Promise<D>
  },
): EventHandler<Request, D> {
  if (typeof handler === 'function') {
    return defineEventHandler({
      onRequest: [isAuthenticated],
      handler: handler as EventHandler,
    })
  }

  return defineEventHandler({
    onRequest: [
      isAuthenticated,
      ...(handler.onRequest || []),
    ],
    handler: handler.handler as EventHandler,
  })
}
