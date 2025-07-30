<script lang="ts" setup>
interface Props {
  userId: string
}

const props = defineProps<Props>()

const { url } = useSiteConfig()
const authStore = useAuthStore()
const avatarUrl = new URL(`/api/auth/avatar/${props.userId}`, url)
const token = authStore.getSessionToken()
if (token) {
  avatarUrl.searchParams.set('token', token)
}
const imageUrl = avatarUrl.toString()
</script>

<template>
  <UAvatar :src="imageUrl" />
</template>
