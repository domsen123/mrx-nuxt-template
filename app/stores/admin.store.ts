import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { useRouteQuery } from '@vueuse/router'

export const useAdminStore = () => {
  const authClient = useAuthClient()
  const queryCache = useQueryCache()

  // Query for listing users
  const useListUsers = ({
    page = ref(1),
    pageSize = ref(10),
    searchTerm = ref(''),
    orderBy = ref('name'),
  }: {
    page?: Ref<number>
    pageSize?: Ref<number>
    searchTerm?: Ref<string>
    orderBy?: Ref<string>
  } = {}) => {
    const _searchTerm = debouncedRef(searchTerm, 300)

    const limit = computed(() => pageSize.value)
    const offset = computed(() => (page.value - 1) * limit.value)

    const sortBy = computed(() => orderBy.value.replace(/^-/, ''))
    const sortDirection = computed(() => orderBy.value.startsWith('-') ? 'desc' : 'asc')

    watch(_searchTerm, () => {
      page.value = 1
    })

    const queryResult = useQuery({
      key: () => ['admin', 'users', page.value, pageSize.value, _searchTerm.value],
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
