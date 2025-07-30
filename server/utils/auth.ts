import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { createAuthMiddleware } from 'better-auth/api'
import { admin } from 'better-auth/plugins'
import { count, eq } from 'drizzle-orm'
import { ulid } from 'ulid'
import config from '../config'
import { user } from '../database'
import { getDatabase } from '../database/config'

export const auth = betterAuth({
  database: drizzleAdapter(getDatabase(), {
    provider: 'pg',
  }),
  baseURL: config.site.url,
  secret: config.security.auth_secret,
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ url }) => {
      console.info(`Click the link to reset your password: ${url}`)
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`)
    },
  },
  plugins: [
    admin(),
  ],
  advanced: {
    database: {
      generateId: () => ulid(),
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith('/sign-up')) {
        const db = getDatabase()
        const [{ count: userCount }] = await db.select({ count: count() }).from(user)
        if (userCount === 1) {
          console.info('First user created, setting as admin.')
          const newSession = ctx.context.newSession
          if (newSession) {
            await db.update(user).set({ role: 'admin' }).where(eq(user.id, newSession.user.id))
          }
        }
      }
    }),
  },
})
