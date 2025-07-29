import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type * as schema from '~~/server/database/schema'

export interface IDatabase {
  user: {
    select: InferSelectModel<typeof schema.user>
    insert: InferInsertModel<typeof schema.user>
  }
  session: {
    select: InferSelectModel<typeof schema.session>
    insert: InferInsertModel<typeof schema.session>
  }
}
