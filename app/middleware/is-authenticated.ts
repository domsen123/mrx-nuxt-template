export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith('/auth')) {
    return
  }
  const authStore = useAuthStore()

  if (!authStore.session?.user) {
    return '/auth/login'
  }
})
