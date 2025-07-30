<script lang="ts" setup>
import type { TableColumn } from '#ui/types'
import { upperFirst } from 'scule'
import { h } from 'vue'
import { getRoleColor, getRoles } from '~/utils/roles'

const { useListUsers } = useAdminStore()
const { data, isLoading } = useListUsers()
const _authClient = useAuthClient()
const authStore = useAuthStore()

type UserWithRole = typeof _authClient.$Infer.Session['user']

type ActionType = 'setRole' | 'setPassword' | 'ban' | 'unban' | 'delete' | 'viewSessions' | 'create'

const UCheckbox = resolveComponent('UCheckbox')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const users = computed<UserWithRole[]>(() => {
  return data.value && data.value.users ? data.value.users as UserWithRole[] : []
})

const toast = useToast()
const isModalOpen = ref(false)
const currentAction = ref<ActionType | null>(null)
const selectedUser = ref<UserWithRole | null>(null)

const openModal = (action: ActionType, user: UserWithRole | null = null) => {
  console.log('Opening modal for action:', action, 'on user:', user)
  currentAction.value = action
  selectedUser.value = user
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  currentAction.value = null
  selectedUser.value = null
}

const formComponents: Record<ActionType, any> = {
  setRole: resolveComponent('AdminFormSetUserRole'),
  setPassword: resolveComponent('AdminFormSetUserPassword'),
  ban: resolveComponent('AdminFormBanUser'),
  unban: resolveComponent('AdminFormUnbanUser'),
  delete: resolveComponent('AdminFormDeleteUser'),
  viewSessions: resolveComponent('AdminFormViewSessions'),
  create: resolveComponent('AdminFormCreateUser'),
}

const getCurrentFormComponent = () => {
  if (!currentAction.value) {
    return null
  }
  return formComponents[currentAction.value]
}

const getModalTitle = () => {
  const titles: Record<ActionType, string> = {
    setRole: 'Set User Role',
    setPassword: 'Set User Password',
    ban: 'Ban User',
    unban: 'Unban User',
    delete: 'Delete User',
    viewSessions: 'View User Sessions',
    create: 'Create New User',
  }
  return currentAction.value ? titles[currentAction.value] : ''
}

const handleFormSuccess = () => {
  closeModal()
}

const handleImpersonate = async (user: UserWithRole) => {
  try {
    await authStore.startImpersonation(user.id)
    await navigateTo('/')
  }
  catch (error) {
    console.error('Failed to impersonate user:', error)
    toast.add({
      title: 'Impersonation Failed',
      description: 'An error occurred while trying to impersonate the user.',
      color: 'error',
    })
  }
}

const columns = [
  {
    id: 'select',
    header: ({ table }) => h(UCheckbox, {
      'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
      'aria-label': 'Select all',
    }),
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean) => row.toggleSelected(!!value),
      'aria-label': 'Select row',
    }),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => row.getValue('name') || '-',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.getValue('email'),
  },
  {
    accessorKey: 'role',
    header: 'Roles',
    cell: ({ row }) => {
      const roleString = row.getValue('role') as string
      const roles = getRoles(roleString)

      if (roles.length === 0) {
        return h(UBadge, { variant: 'subtle', color: 'neutral' }, () => 'user')
      }

      return h('div', { class: 'flex flex-wrap gap-1' }, roles.map(role =>
        h(UBadge, {
          variant: 'subtle',
          color: getRoleColor(role),
          class: 'text-xs',
        }, () => upperFirst(role)),
      ))
    },
  },
  {
    accessorKey: 'emailVerified',
    header: 'Email Status',
    cell: ({ row }) => {
      const verified = row.getValue('emailVerified') as boolean
      const status = verified ? 'Verified' : 'Unverified'
      const color = verified ? 'success' : 'neutral'
      return h(UBadge, { variant: 'subtle', color }, () => status)
    },
  },
  {
    accessorKey: 'banned',
    header: 'Ban Status',
    cell: ({ row }) => {
      const user = row.original as UserWithRole
      const isBanned = user.banned

      if (!isBanned) {
        return h(UBadge, { variant: 'subtle', color: 'success' }, () => 'Active')
      }

      // Check if ban is expired
      const isExpired = user.banExpires && new Date(user.banExpires) < new Date()

      if (isExpired) {
        return h(UBadge, { variant: 'subtle', color: 'warning' }, () => 'Expired')
      }

      const isPermanent = !user.banExpires
      const status = isPermanent ? 'Banned' : `Banned (${new Date(user.banExpires!).toLocaleDateString()})`

      return h(UBadge, { variant: 'subtle', color: 'error' }, () => status)
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = new Date(row.getValue('createdAt'))
      return Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => h(UDropdownMenu, {
      items: [[
        {
          label: 'View Details',
          icon: 'i-lucide-eye',
          onClick: () => console.log('View user:', row.original.id),
        },
        {
          label: 'View Sessions',
          icon: 'i-lucide-activity',
          onClick: () => openModal('viewSessions', row.original),
        },
        {
          label: 'Impersonate User',
          icon: 'i-lucide-user-check',
          onClick: () => handleImpersonate(row.original),
        },
      ], [
        {
          label: 'Set Role',
          icon: 'i-lucide-shield',
          onClick: () => openModal('setRole', row.original),
        },
        {
          label: 'Set Password',
          icon: 'i-lucide-key',
          onClick: () => openModal('setPassword', row.original),
        },
      ], [
        ...(row.original.banned
          ? [{
              label: 'Unban User',
              icon: 'i-lucide-shield-check',
              onClick: () => openModal('unban', row.original),
            }]
          : [{
              label: 'Ban User',
              icon: 'i-lucide-ban',
              onClick: () => openModal('ban', row.original),
            }]),
        {
          label: 'Delete User',
          icon: 'i-lucide-trash-2',
          color: 'error' as const,
          onClick: () => openModal('delete', row.original),
        },
      ]],
    }, {
      default: () => h(UButton, {
        variant: 'ghost',
        color: 'neutral',
        icon: 'i-lucide-ellipsis',
      }),
    }),
  },
] satisfies TableColumn<UserWithRole>[]
</script>

<template>
  <AdminPageWrapper title="Users">
    <div class="space-y-4">
      <!-- Page Actions -->
      <div class="flex justify-end">
        <UButton
          icon="i-lucide-user-plus"
          label="Create New User"
          @click="openModal('create')"
        />
      </div>

      <UTable
        :columns="columns"
        :data="users"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <UIcon name="i-lucide-users" class="text-4xl text-gray-400" />
            <p class="text-sm text-gray-500">
              No users found
            </p>
          </div>
        </template>
      </UTable>
    </div>

    <!-- Dynamic Modal for User Actions -->
    <UModal v-model:open="isModalOpen">
      <template #content>
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">
            {{ getModalTitle() }}
          </h2>
          <component
            :is="getCurrentFormComponent()"
            v-if="currentAction"
            :key="`${currentAction}-${selectedUser?.id || 'new'}`"
            :user="selectedUser"
            @success="handleFormSuccess"
            @cancel="closeModal"
          />
        </div>
      </template>
    </UModal>
  </AdminPageWrapper>
</template>
