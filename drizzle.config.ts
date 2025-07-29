import { defineConfig } from 'drizzle-kit'
import config from './server/config'

export default defineConfig({
  schema: './server/database/schema/*',
  out: './server/database/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: config.database.url,
  },
})
