<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  collapsed?: boolean
}>()

const authStore = useAuthStore()

const colorMode = useColorMode()
const appConfig = useAppConfig()

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone']

const user = computed(() => ({
  name: authStore.currentUser?.name || '',
  avatar: {
    src: authStore.currentUser?.image || undefined,
    alt: authStore.currentUser?.name,
  },
}))

const items = computed<DropdownMenuItem[][]>(() => ([[{
  type: 'label',
  label: user.value.name,
  avatar: user.value.avatar,
}], [
  {
    label: 'Profile',
    icon: 'i-lucide-user',
    to: '/settings/profile',
  },
  {
    label: 'Account',
    icon: 'i-lucide-settings',
    to: '/settings/account',
  },
  {
    label: 'Appearance',
    icon: 'i-lucide-paintbrush',
    to: '/settings/appearance',
  },
], [{
  label: 'Theme',
  icon: 'i-lucide-palette',
  children: [{
    label: 'Primary',
    slot: 'chip',
    chip: appConfig.ui.colors.primary,
    content: {
      align: 'center',
      collisionPadding: 16,
    },
    children: colors.map(color => ({
      label: color,
      chip: color,
      slot: 'chip',
      checked: appConfig.ui.colors.primary === color,
      type: 'checkbox',
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.primary = color
      },
    })),
  }, {
    label: 'Neutral',
    slot: 'chip',
    chip: appConfig.ui.colors.neutral === 'neutral' ? 'old-neutral' : appConfig.ui.colors.neutral,
    content: {
      align: 'end',
      collisionPadding: 16,
    },
    children: neutrals.map(color => ({
      label: color,
      chip: color === 'neutral' ? 'old-neutral' : color,
      slot: 'chip',
      type: 'checkbox',
      checked: appConfig.ui.colors.neutral === color,
      onSelect: (e) => {
        e.preventDefault()

        appConfig.ui.colors.neutral = color
      },
    })),
  }],
}, {
  label: 'Appearance',
  icon: 'i-lucide-sun-moon',
  children: [{
    label: 'Light',
    icon: 'i-lucide-sun',
    type: 'checkbox',
    checked: colorMode.value === 'light',
    onSelect(e: Event) {
      e.preventDefault()

      colorMode.preference = 'light'
    },
  }, {
    label: 'Dark',
    icon: 'i-lucide-moon',
    type: 'checkbox',
    checked: colorMode.value === 'dark',
    onUpdateChecked(checked: boolean) {
      if (checked) {
        colorMode.preference = 'dark'
      }
    },
    onSelect(e: Event) {
      e.preventDefault()
    },
  }],
}], [
  ...(authStore.session?.session.impersonatedBy
    ? [
        {
          label: 'Stop Impersonation',
          icon: 'i-lucide-user-minus',
          onSelect: async (e: Event) => {
            e.preventDefault()
            await authStore.stopImpersonation()
            useRouter().replace({
              path: '/',
              force: true,
            })
          },
        },
      ]
    : []),
  {
    label: 'Log out',
    icon: 'i-lucide-log-out',
    class: 'text-error',
    onSelect: async (e: Event) => {
      e.preventDefault()
      await useAuthClient().signOut()
      navigateTo('/auth/login', {
        replace: true,
      })
    },
  },
]]))
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />

    <template #chip-leading="{ item }">
      <span
        :style="{
          '--chip-light': `var(--color-${(item as any).chip}-500)`,
          '--chip-dark': `var(--color-${(item as any).chip}-400)`,
        }"
        class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)"
      />
    </template>
  </UDropdownMenu>
</template>
