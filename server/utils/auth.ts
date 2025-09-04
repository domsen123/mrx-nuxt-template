import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { count } from 'drizzle-orm'
import { ulid } from 'ulid'
import { avatarPlugin } from '../../shared/plugins/better-auth/avatar/server'
import config from '../config'
import { user } from '../database'
import { getBetterAuthAdapter, getDatabase, getDatabaseDriver, getMongoDatabase } from '../database/config'

export const plugins = [
  admin(),
  avatarPlugin(),
]

export const auth = betterAuth({
  database: getBetterAuthAdapter(),
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
  plugins,
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
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          const driver = getDatabaseDriver()
          let userCount = 0

          if (driver === 'mongodb') {
            const db = getMongoDatabase()
            userCount = await db.collection('user').countDocuments()
          }
          else if (driver === 'postgres') {
            const db = getDatabase()
            const [{ count: countResult }] = await db.select({ count: count() }).from(user)
            userCount = Number(countResult)
          }

          if (userCount === 0) {
            return {
              data: {
                ...newUser,
                role: 'admin',
                emailVerified: true,
              },
            }
          }

          return true
        },
      },
    },
  },

})
