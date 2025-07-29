import { useMutation, useQuery, useQueryCache } from '@pinia/colada'

export const useAdminStore = () => {
  const authClient = useAuthClient()
  const queryCache = useQueryCache()

  // Query for listing users
  const useListUsers = () => useQuery({
    key: () => ['admin', 'users'],
    query: async () => {
      const { data, error } = await authClient.admin.listUsers({
        query: {},
      })
      if (error) {
        throw error
      }
      return data
    },
  })

  // Invalidate users query helper
  const invalidateUsers = () => {
    queryCache.invalidateQueries({ key: ['admin', 'users'], exact: true })
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
