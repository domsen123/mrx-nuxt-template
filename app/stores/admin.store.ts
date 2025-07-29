import { useQuery } from '@pinia/colada'

export const useAdminStore = () => {
  const authClient = useAuthClient()

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

  return {
    useListUsers,
  }
}
