import { getRoles } from '~/utils/roles'

export const useAuthStore = defineStore('auth', () => {
  const authClient = useAuthClient()

  type Session = typeof authClient.$Infer.Session
  const session = ref<Session | null>(null)

  const getSession = async () => {
    const response = await authClient.getSession()
    if (response.error) {
      session.value = null
      return null
    }
    session.value = response.data
    return session.value
  }

  const getSessionToken = (): string | undefined => {
    return session.value?.session.token || undefined
  }

  const loginWithEmailAndPassword = async (email: string, password: string) => {
    try {
      await authClient.signIn.email({
        email,
        password,
      })
      await getSession()
    }
    catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const signUpWithEmailAndPassword = async (name: string, email: string, password: string) => {
    try {
      await authClient.signUp.email({
        name,
        email,
        password,
      })
      await getSession()
    }
    catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  }

  const updateName = async (name: string) => {
    await authClient.updateUser({
      name,
    })
    await getSession()
  }

  const startImpersonation = async (userId: string) => {
    try {
      const response = await authClient.admin.impersonateUser({
        userId,
      })
      if (response.error) {
        throw response.error
      }
      session.value = response.data as Session
      return session.value
    }
    catch (error) {
      console.error('Impersonation failed:', error)
      throw error
    }
  }

  const stopImpersonation = async () => {
    try {
      await authClient.admin.stopImpersonating()
      await getSession()
    }
    catch (error) {
      console.error('Stopping impersonation failed:', error)
      throw error
    }
  }

  const currentUser = computed(() => session.value?.user || null)
  const isAuthenticated = computed(() => !!session.value)
  const isAdmin = computed(() => session.value?.user?.role ? getRoles(session.value.user.role).includes('admin') : false)

  return {

    session,
    currentUser,
    isAuthenticated,
    isAdmin,
    getSession,
    getSessionToken,
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword,
    startImpersonation,
    stopImpersonation,
    updateName,
  }
})
