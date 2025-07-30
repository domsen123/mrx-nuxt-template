export const listBetterAuthPlugins = async (): Promise<string[]> => {
  if (import.meta.client) {
    const { plugins } = await import('~/composables/useAuthClient')
    return plugins.map(plugin => plugin.id)
  }
  if (import.meta.server) {
    const { plugins } = await import('~~/server/utils/auth')
    return plugins.map(plugin => plugin.id) as string[]
  }
  return []
}
