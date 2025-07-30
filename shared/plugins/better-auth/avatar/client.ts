import type { avatarPlugin, DeleteAvatarResponse, GetAvatarResponse, UploadAvatarResponse } from './server'

interface AvatarClientActions {
  uploadAvatar: (
    formData: FormData,
    fetchOptions?: RequestInit
  ) => Promise<{ data: UploadAvatarResponse | null, error: any }>

  getAvatar: (
    userId: string,
    fetchOptions?: RequestInit
  ) => Promise<{ data: GetAvatarResponse | null, error: any }>

  deleteAvatar: (
    fetchOptions?: RequestInit
  ) => Promise<{ data: DeleteAvatarResponse | null, error: any }>
}

export const avatarPluginClient = () => {
  return {
    id: 'avatar',
    $InferServerPlugin: {} as ReturnType<typeof avatarPlugin>,

    getActions: ($fetch: any): AvatarClientActions => ({
      uploadAvatar: async (formData: FormData, fetchOptions?: RequestInit) => {
        const { data, error } = await $fetch('/avatar/upload', {
          method: 'POST',
          body: formData,
          ...fetchOptions,
        })

        return { data, error }
      },

      getAvatar: async (userId: string, fetchOptions?: RequestInit) => {
        const { data, error } = await $fetch(`/avatar/${userId}`, {
          method: 'GET',
          ...fetchOptions,
        })

        return { data, error }
      },

      deleteAvatar: async (fetchOptions?: RequestInit) => {
        const { data, error } = await $fetch('/avatar/delete', {
          method: 'POST',
          ...fetchOptions,
        })

        return { data, error }
      },
    }),
  }
}
