import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { ulid } from 'ulid'
import config from '../config'
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
      // your logic here
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
})
