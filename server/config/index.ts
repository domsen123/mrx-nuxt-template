import process from 'node:process'
import dotenv from 'dotenv'

// parse --env argument
const envArg = process.argv.find(arg => arg.startsWith('--dotenv=')) || '--dotenv=.env'
const envFile = envArg.split('=')[1] || '.env'

// Try to load .env file, but don't fail if it doesn't exist in production
const envFound = dotenv.config({
  path: envFile,
})
if (envFound.error && process.env.NODE_ENV !== 'production') {
  throw new Error(`⚠️  Couldn't find ${envFile} file  ⚠️`)
}

process.env.NODE_ENV = process.env.NUXT_SITE_ENV || 'development'

const requiredEnvVars = [
  'NUXT_SITE_NAME',
  'NUXT_SITE_ENV',
  'NUXT_SITE_URL',
  'NUXT_DATABASE_URL',
  'NUXT_AUTH_SECRET',
  'NUXT_SESSION_SECRET',
]

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`⚠️  Missing required environment variable: ${key} ⚠️`)
  }
})

const config = {
  site: {
    name: process.env.NUXT_SITE_NAME || '',
    env: process.env.NUXT_SITE_ENV || '',
    url: process.env.NUXT_SITE_URL || '',
  },
  database: {
    url: process.env.NUXT_DATABASE_URL || '',
    pool_max: Number.parseInt(process.env.NUXT_DB_POOL_MAX || '10'),
  },
  security: {
    auth_secret: process.env.NUXT_AUTH_SECRET || '',
    session_secret: process.env.NUXT_SESSION_SECRET || '',
  },
  wordpress: {
    url: process.env.NUXT_PUBLIC_WORDPRESS_URL || 'https://wp-example.com',
  },
}

export default config
export type Config = typeof config
