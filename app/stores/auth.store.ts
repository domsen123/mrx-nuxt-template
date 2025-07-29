export const useAuthStore = defineStore('auth', () => {
  const authClient = useAuthClient()

  const session = ref<typeof authClient.$Infer.Session | null>(null)

  const getRoles = (roles: string) => {
    return roles.split(',').map(role => role.trim())
  }

  const getSession = async () => {
    const response = await authClient.getSession()
    if (response.error) {
      session.value = null
      return null
    }
    session.value = response.data
    return session.value
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

  const currentUser = computed(() => session.value?.user || null)
  const isAuthenticated = computed(() => !!session.value)
  const isAdmin = computed(() => session.value?.user?.role ? getRoles(session.value.user.role).includes('admin') : false)

  return {
    session,
    currentUser,
    isAuthenticated,
    isAdmin,
    getSession,
    signUpWithEmailAndPassword,
    loginWithEmailAndPassword,
  }
})
