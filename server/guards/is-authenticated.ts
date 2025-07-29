import type { H3Event } from 'h3'

export const isAuthenticated = (event: H3Event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }
}
