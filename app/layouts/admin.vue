<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
// const toast = useToast()

const open = ref(false)

const links = computed<NavigationMenuItem[][]>(() => [
  [
    // {
    //   label: 'Dashboard',
    //   to: '/admin',
    //   icon: 'i-lucide-bar-chart-3',
    //   active: route.path === '/admin',
    // },
    {
      label: 'Users',
      to: '/admin/users',
      icon: 'i-lucide-users-round',
      active: route.path.startsWith('/admin/users'),
    },
    {
      label: 'Waitlist',
      to: '/admin/waitlist',
      icon: 'i-lucide-user-round-check',
      active: route.path.startsWith('/admin/waitlist'),
    },
  ],
])

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.value.flat(),
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="font-semibold">
          <span v-if="collapsed">ADM</span>
          <span v-else>Nuxt UI Admin</span>
        </NuxtLink>
      </template>
      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" label="Suchen ..." />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>
