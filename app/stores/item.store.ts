import type { BaseItem, Filter, FilterChain, QueryManyResult } from '~~/server/types'

interface QueryParams {
  searchFields: string[]
  filters?: Ref<FilterChain | FilterChain[] | Filter | Filter[]>
}

export const useItemStore = () => {
  const { $api } = useNuxtApp()
  // const queryCache = useQueryCache()

  // since this stuff is the same shit like the admin.store.ts I should consider creating an composable out of this
  // for now - fuck it.
  const useListItems = <T extends BaseItem = BaseItem>(collection: Ref<string>, params: QueryParams) => {
    // PAGINATION
    const page = useRouteQuery('page', 1, { transform: Number, mode: 'push' })
    const pageSize = useRouteQuery('pageSize', 10, { transform: Number, mode: 'push' })

    // SEARCHING
    const searchTermUrl = useRouteQuery<string>('searchTerm', '', { mode: 'push' })
    const searchTerm = ref(searchTermUrl.value) // Input field ref (for immediate UI updates)
    const _searchTerm = debouncedRef(searchTerm, 300) // Debounced for API calls

    // Sync input field with URL on initial load
    watch(searchTermUrl, (newValue) => {
      if (newValue !== searchTerm.value) {
        searchTerm.value = newValue
      }
    }, { immediate: true })

    // Watch debounced search term to update URL and reset page
    watch(_searchTerm, () => {
      searchTermUrl.value = _searchTerm.value
      page.value = 1 // Reset to first page when searching
    })

    // SORTING
    const orderBy = useRouteQuery('orderBy', undefined, { mode: 'push' })

    const queryResult = useQuery({
      key: () => [
        'items',
        collection.value,
        page.value,
        pageSize.value,
        _searchTerm.value,
        orderBy.value ? JSON.stringify(orderBy.value) : '',
        params.filters?.value ? JSON.stringify(params.filters.value) : '',
      ],
      query: async () => await $api<QueryManyResult<T>>(`/api/items/${collection.value}`, {
        query: {
          page: page.value,
          pageSize: pageSize.value,
          search: {
            term: _searchTerm.value,
            fields: params.searchFields,
          },
          filters: params.filters?.value,
          orderBy: orderBy.value,
        },
      }),
    })

    return {
      ...queryResult,
      page,
      pageSize,
      searchTerm,
      orderBy,
    }
  }

  return {
    useListItems,
  }
}
