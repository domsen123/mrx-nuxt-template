import type { H3Event } from 'h3'
import type { auth } from '~~/server/utils/auth'

export const isAdmin = (event: H3Event) => {
  if (!event.context.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required',
    })
  }

  const user = event.context.user as typeof auth.$Infer.Session.user
  if (!user || !user.role) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required',
    })
  }

  const roles = user.role || ''
  const parsedRoles = roles.split(',').map(role => role.trim())

  if (!parsedRoles.includes('admin')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin privileges required',
    })
  }
}
