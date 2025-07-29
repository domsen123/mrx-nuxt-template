import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

export const useAuthClient = () => {
  const cookieString = useRequestHeader('cookie')
  const { url } = useSiteConfig()

  const authClient = createAuthClient({
    baseURL: url,
    fetchOptions: {
      credentials: 'include',
      headers: cookieString ? { cookie: cookieString } : undefined,
    },
    plugins: [
      adminClient(),
    ],
  })

  return authClient
}
