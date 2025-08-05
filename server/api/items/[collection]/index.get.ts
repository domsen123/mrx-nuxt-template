import type { QueryManyParams } from '~~/server/types'
import { isAdmin } from '~~/server/guards/is-admin'
import { getItemRepository } from '~~/server/locator'

export default defineAuthenticatedEventHandler({
  onRequest: [
    isAdmin,
  ],
  handler: async (event) => {
    const collection = getRouterParam(event, 'collection')
    if (!collection) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Collection parameter is required',
      })
    }

    const queryParams = getQuery(event) as QueryManyParams

    const page = Number(queryParams.page) || 1
    const pageSize = Number(queryParams.pageSize) || 10
    const search = queryParams.search ? JSON.parse(queryParams.search as unknown as string) : undefined
    const filters = queryParams.filters ? JSON.parse(queryParams.filters as unknown as string) : undefined
    const orderBy = queryParams.orderBy ? JSON.parse(queryParams.orderBy as unknown as string) : undefined

    const itemRepository = getItemRepository(event)
    return await itemRepository.collection(collection).queryMany({
      page,
      pageSize,
      search,
      filters,
      orderBy,
    })
  },
})
