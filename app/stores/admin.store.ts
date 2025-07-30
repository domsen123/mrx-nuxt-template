import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { useRouteQuery } from '@vueuse/router'

export const useAdminStore = () => {
  const authClient = useAuthClient()
  const queryCache = useQueryCache()

  // Query for listing users
  const useListUsers = () => {
    // PAGINATION
    const page = useRouteQuery('page', 1, { transform: Number, mode: 'push' })
    const pageSize = useRouteQuery('pageSize', 10, { transform: Number, mode: 'push' })

    // Computed values for pagination
    const limit = computed(() => pageSize.value)
    const offset = computed(() => (page.value - 1) * limit.value)

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
    const orderBy = useRouteQuery('orderBy', 'name', { mode: 'push' })

    // Extract sort field and direction from orderBy (e.g., "-name" = desc, "name" = asc)
    const sortBy = computed(() => orderBy.value.replace(/^-/, ''))
    const sortDirection = computed(() => orderBy.value.startsWith('-') ? 'desc' : 'asc')

    // QUERY EXECUTION
    const queryResult = useQuery({
      key: () => ['admin', 'users', page.value, pageSize.value, _searchTerm.value, orderBy.value],
      query: async () => {
        const { data, error } = await authClient.admin.listUsers({
          query: {
            searchValue: _searchTerm.value,
            searchField: 'name',
            searchOperator: 'contains',
            limit: limit.value,
            offset: offset.value,
            sortBy: sortBy.value,
            sortDirection: sortDirection.value,
          },
        })
        if (error) {
          throw error
        }
        return data
      },
    })

    return {
      ...queryResult,
      page,
      pageSize,
      searchTerm,
      orderBy,
    }
  }

  const invalidateUsers = () => {
    queryCache.invalidateQueries({ key: ['admin', 'users'] })
  }

  // Ban user mutation
  const useBanUser = () => useMutation({
    mutation: async (params: { userId: string, reason: string, expiresAt?: string }) => {
      const { data, error } = await authClient.admin.banUser(params)
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: () => {
      invalidateUsers()
    },
  })

  // Unban user mutation
  const useUnbanUser = () => useMutation({
    mutation: async (params: { userId: string }) => {
      const { data, error } = await authClient.admin.unbanUser(params)
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: () => {
      invalidateUsers()
    },
  })

  // Create user mutation
  const useCreateUser = () => useMutation({
    mutation: async (params: {
      email: string
      password: string
      name: string
      role: 'user' | 'admin'
    }) => {
      const { data, error } = await authClient.admin.createUser(params)
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: () => {
      invalidateUsers()
    },
  })

  // Set user role mutation
  const useSetUserRole = () => useMutation({
    mutation: async (params: { userId: string, role: 'user' | 'admin' }) => {
      const { data, error } = await authClient.admin.setRole(params)
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: () => {
      invalidateUsers()
    },
  })

  // Set user password mutation
  const useSetUserPassword = () => useMutation({
    mutation: async (params: { userId: string, newPassword: string }) => {
      const { data, error } = await authClient.admin.setUserPassword(params)
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: () => {
      invalidateUsers()
    },
  })

  // Delete user mutation
  const useDeleteUser = () => useMutation({
    mutation: async (params: { userId: string }) => {
      const { data, error } = await authClient.admin.removeUser(params)
      if (error) {
        throw error
      }
      return data
    },
    onSuccess: () => {
      invalidateUsers()
    },
  })

  return {
    useListUsers,
    useBanUser,
    useUnbanUser,
    useCreateUser,
    useSetUserRole,
    useSetUserPassword,
    useDeleteUser,
  }
}
