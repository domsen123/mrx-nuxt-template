import type { SQL } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type { H3Event } from 'h3'
import type { Hookable } from 'hookable'
import type * as schema from '../database/schema'
import type { BaseItem, Filter, FilterChain, QueryManyParams, QueryManyResult } from '../types'
import type { auth } from '../utils/auth'
import { and, or, sql } from 'drizzle-orm'
import { ulid } from 'ulid'

type User = typeof auth.$Infer.Session.user

export class ItemRepository<T extends BaseItem = BaseItem> {
  private tableName?: string

  constructor(
    private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly hooks: Hookable<Record<string, any>, string>,
    private readonly event?: H3Event,
  ) {}

  get currentUser(): User | null {
    return this.event?.context.user || null
  }

  get realColumns(): string[] {
    return ['id', 'created_at', 'updated_at', 'created_by', 'updated_by']
  }

  private filterCondition = (field: string, operator: string, value: any): SQL => {
    switch (operator) {
      case '_eq':
        return this.realColumns.includes(field)
          ? sql`${sql.identifier(field)} = ${value}`
          : sql`(data ->> ${field}) = ${value}`
      case '_ne':
        return this.realColumns.includes(field)
          ? sql`${sql.identifier(field)} != ${value}`
          : sql`(data ->> ${field}) != ${value}`
      case '_gt':
        return this.realColumns.includes(field)
          ? sql`${sql.identifier(field)} > ${value}`
          : sql`(data ->> ${field})::numeric > ${value}`
      case '_lt':
        return this.realColumns.includes(field)
          ? sql`${sql.identifier(field)} < ${value}`
          : sql`(data ->> ${field})::numeric < ${value}`
      case '_gte':
        return this.realColumns.includes(field)
          ? sql`${sql.identifier(field)} >= ${value}`
          : sql`(data ->> ${field})::numeric >= ${value}`
      case '_lte':
        return this.realColumns.includes(field)
          ? sql`${sql.identifier(field)} <= ${value}`
          : sql`(data ->> ${field})::numeric <= ${value}`
      case '_like':
        return this.realColumns.includes(field)
          ? sql`${sql.identifier(field)} ILIKE ${`%${value}%`}`
          : sql`(data ->> ${field}) ILIKE ${`%${value}%`}`
      default:
        return sql`${sql.identifier(field)} ${sql.raw(operator)} ${value}`
    }
  }

  private parseFiltersRecursive = (filters: QueryManyParams['filters']): SQL => {
    if (typeof filters === 'object' && ('_and' in filters || '_or' in filters)) {
      const filterChain = filters as FilterChain
      const chainFilters: SQL[] = []

      if ('_and' in filterChain && filterChain._and) {
        const andFilters = Array.isArray(filterChain._and) ? filterChain._and : [filterChain._and]
        for (const subFilter of andFilters) {
          chainFilters.push(this.parseFiltersRecursive(subFilter))
        }
        return and(...chainFilters)!
      }
      if ('_or' in filterChain && filterChain._or) {
        const orFilters = Array.isArray(filterChain._or) ? filterChain._or : [filterChain._or]
        for (const subFilter of orFilters) {
          chainFilters.push(this.parseFiltersRecursive(subFilter))
        }
        return or(...chainFilters)!
      }
    }
    if (Array.isArray(filters)) {
      const conditions = filters.map(f => this.parseFiltersRecursive(f))
      return and(...conditions)!
    }

    const { filterField, filterOperator, filterValue } = filters as Filter
    return this.filterCondition(filterField, filterOperator, filterValue)
  }

  private toNewItem = (item: any) => ({
    id: ulid(),
    data: JSON.stringify(item),
    createdAt: new Date().toISOString(),
    createdBy: this.currentUser?.id || null,
  })

  private toUpdatedItem = (item: any) => ({
    data: JSON.stringify(item),
    updatedAt: new Date().toISOString(),
    updatedBy: this.currentUser?.id || null,
  })

  private toReturnItem = (item: any): T => {
    const { data } = item
    return {
      id: item.id,
      ...data,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
    }
  }

  private async ensureTable(name: string): Promise<void> {
    await this.db.execute(sql`CREATE TABLE IF NOT EXISTS ${sql.identifier(name)} (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      created_by TEXT REFERENCES "user"(id) ON DELETE SET NULL,
      updated_by TEXT REFERENCES "user"(id) ON DELETE SET NULL
    )`)
  }

  collection(name: string): ItemRepository {
    this.tableName = name
    return this
  }

  async insertOne(item: any) {
    if (!this.tableName) {
      throw new Error('No collection selected. Call collection() first.')
    }

    await this.ensureTable(this.tableName)
    const data = this.toNewItem(item)

    await this.db.execute(sql`
      INSERT INTO ${sql.identifier(this.tableName)} (id, data, created_at, created_by)
      VALUES (${data.id}, ${data.data}::jsonb, ${data.createdAt}, ${data.createdBy})
    `)

    return data
  }

  async updateOne(id: string, item: any) {
    if (!this.tableName) {
      throw new Error('No collection selected. Call collection() first.')
    }

    await this.ensureTable(this.tableName)
    const data = this.toUpdatedItem(item)

    await this.db.execute(sql`
      UPDATE ${sql.identifier(this.tableName)}
      SET data = ${data.data}::jsonb, updated_at = ${data.updatedAt}, updated_by = ${data.updatedBy}
      WHERE id = ${id}
    `)

    return { id, ...data }
  }

  async deleteOne(id: string) {
    if (!this.tableName) {
      throw new Error('No collection selected. Call collection() first.')
    }

    await this.ensureTable(this.tableName)

    await this.db.execute(sql`
      DELETE FROM ${sql.identifier(this.tableName)}
      WHERE id = ${id}
    `)
  }

  async readOne(id: string) {
    if (!this.tableName) {
      throw new Error('No collection selected. Call collection() first.')
    }

    await this.ensureTable(this.tableName)

    const [result] = await this.db.execute(sql`
      SELECT * FROM ${sql.identifier(this.tableName)}
      WHERE id = ${id}
    `)

    return result ? this.toReturnItem(result) : null
  }

  async readMany(ids: string[]) {
    if (!this.tableName) {
      throw new Error('No collection selected. Call collection() first.')
    }

    await this.ensureTable(this.tableName)

    const results = await this.db.execute(sql`
      SELECT * FROM ${sql.identifier(this.tableName)}
      WHERE id IN (${sql.join(ids.map(id => sql`${id}`), sql`, `)})
    `)

    return results.map(this.toReturnItem)
  }

  async queryMany(params: QueryManyParams): Promise<QueryManyResult<T>> {
    if (!this.tableName) {
      throw new Error('No collection selected. Call collection() first.')
    }

    await this.ensureTable(this.tableName)

    const { page = 1, pageSize = 10, search, filters, orderBy } = params

    // Pagination Stuff
    const offset = (Number(page) - 1) * Number(pageSize)
    const limit = Number(pageSize)

    // SELECT STUFF
    const selectQuery = sql`SELECT * FROM ${sql.identifier(this.tableName)}`

    // SEARCH STUFF
    const searchQuery = search && search.term
      ? {
          _and: search.term.split(' ').map(filterValue => ({
            _or: search.fields.map(filterField => ({
              filterField,
              filterOperator: '_like',
              filterValue,
            })),
          })),
        }
      : null

    // FILTER STUFF
    const allConditions: any = {
      _and: [
        ...(searchQuery ? [searchQuery] : []),
        ...(filters ? (Array.isArray(filters) ? filters : [filters]) : []),
      ],
    }

    const condition = allConditions._and.length > 0
      ? this.parseFiltersRecursive(allConditions)
      : null
    const whereClause = condition ? sql`WHERE ${condition}` : sql``

    // ORDER BY STUFF
    const orderByClause = orderBy && orderBy.length > 0
      ? sql`ORDER BY ${sql.join(
        orderBy.map((field) => {
          const direction = field.startsWith('-') ? 'DESC' : 'ASC'
          const column = field.startsWith('-') ? field.slice(1) : field

          return this.realColumns.includes(column)
            ? sql`${sql.identifier(column)} ${sql.raw(direction)}`
            : sql`(data ->> ${column}) ${sql.raw(direction)}`
        }),
        sql`, `,
      )}`
      : sql``

    // LIMIT STUFF
    const limitQuery = sql`LIMIT ${limit} OFFSET ${offset}`

    const [{ count: total }] = await this.db.execute(sql.join(
      [sql`SELECT COUNT(*) FROM ${sql.identifier(this.tableName)}`, whereClause],
    )) as { count: number }[]

    // EXECUTE THIS SHIT
    const result = await this.db.execute(sql.join(
      [selectQuery, whereClause, orderByClause, limitQuery],
      sql` `,
    ))

    return {
      items: result.map(this.toReturnItem),
      meta: {
        total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    }
  }

  async queryOne(params: Omit<QueryManyParams, 'page' | 'pageSize'>) {
    const { items: [result] } = await this.queryMany({ ...params, page: 1, pageSize: 1 })
    return result || null
  }
}
