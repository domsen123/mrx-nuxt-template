import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { Db } from 'mongodb'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'
import { drizzle } from 'drizzle-orm/postgres-js'
import { MongoClient } from 'mongodb'
import postgres from 'postgres'
import config from '../config'
import * as schema from './schema'

const databaseUrl = config.database.url

const getDatabaseClient = () => postgres(databaseUrl, {
  max: config.database.pool_max,
  idle_timeout: 20,
  connect_timeout: 10,
  onnotice: () => {
    // Hide Notice Messages
  },
})

let __db: PostgresJsDatabase<typeof schema> | undefined
export const getDatabase = (): PostgresJsDatabase<typeof schema> => {
  if (!__db) {
    __db = drizzle(getDatabaseClient(), {
      schema,
    })
  }
  return __db
}

let __mongoDb: Db | undefined
export const getMongoDatabase = (): Db => {
  if (!__mongoDb) {
    const mongoClient = new MongoClient(databaseUrl)
    __mongoDb = mongoClient.db(mongoClient.options.dbName || 'database')
  }
  return __mongoDb
}

export const getDatabaseDriver = (): 'mongodb' | 'postgres' => {
  if (databaseUrl.startsWith('mongodb'))
    return 'mongodb'
  else if (databaseUrl.startsWith('postgres'))
    return 'postgres'
  else
    throw new Error('Unsupported database type')
}

export const getBetterAuthAdapter = () => {
  switch (getDatabaseDriver()) {
    case 'mongodb':
      return mongodbAdapter(getMongoDatabase())
    case 'postgres':
      return drizzleAdapter(getDatabase(), {
        provider: 'pg',
      })
  }
}
