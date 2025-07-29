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

export const getDatabase = () => drizzle(getDatabaseClient(), {
  schema,
})
