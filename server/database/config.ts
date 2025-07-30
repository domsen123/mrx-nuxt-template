import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import config from '../config'
import * as schema from './schema'

const databaseUrl = config.database.url

const connectionOptions = {
  max: config.database.pool_max,
  idle_timeout: 20,
  connect_timeout: 10,
}

const getDatabaseClient = () => postgres(databaseUrl, connectionOptions)

let __db: PostgresJsDatabase<typeof schema> | undefined
export const getDatabase = () => {
  if (!__db) {
    __db = drizzle(getDatabaseClient(), {
      schema,
    })
  }
  return __db
}
