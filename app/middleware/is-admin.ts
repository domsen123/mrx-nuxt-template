export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()
  if (authStore.session?.user) {
    const roles = (authStore.session.user.role || '').split(',').map(role => role.trim())
    if (!roles.includes('admin')) {
      return abortNavigation({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'You do not have permission to access this resource.',
      })
    }
  }
})
