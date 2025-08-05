<script lang="ts" setup>
import type { NavigationMenuItem } from '#ui/types'

definePageMeta({
  middleware: [
    'is-authenticated',
  ],
})

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)

const title = computed(() => currentUser.value?.name || '')

const links = computed<NavigationMenuItem[]>(() => [
  { label: 'Profile', to: '/settings/profile', icon: 'i-lucide-user' },
  { label: 'Account', to: '/settings/account', icon: 'i-lucide-settings' },
  { label: 'Apperance', to: '/settings/appearance', icon: 'i-lucide-paintbrush' },
])
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader :title="title" />
      <UPage>
        <template #left>
          <UPageAside>
            <UNavigationMenu :items="links" orientation="vertical" />
          </UPageAside>
        </template>
        <UPageBody>
          <NuxtPage />
        </UPageBody>
      </UPage>
    </UPage>
  </UContainer>
</template>

<style></style>
