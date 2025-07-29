<script lang="ts" setup>
import type { TableColumn } from '#ui/types'
import { upperFirst } from 'scule'
import { h } from 'vue'
import { getRoleColor, getRoles } from '~/utils/roles'

const { useListUsers } = useAdminStore()
const { data, isLoading } = useListUsers()
const _authClient = useAuthClient()

type UserWithRole = typeof _authClient.$Infer.Session['user']

const UCheckbox = resolveComponent('UCheckbox')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const users = computed<UserWithRole[]>(() => {
  return data.value && data.value.users ? data.value.users as UserWithRole[] : []
})

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
    header: 'Status',
    cell: ({ row }) => {
      const verified = row.getValue('emailVerified') as boolean
      const status = verified ? 'Verified' : 'Unverified'
      const color = verified ? 'success' : 'neutral'
      return h(UBadge, { variant: 'subtle', color }, () => status)
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
          click: () => console.log('View user:', row.original.id),
        },
        {
          label: 'Edit',
          icon: 'i-lucide-pencil',
          click: () => console.log('Edit user:', row.original.id),
        },
      ], [
        {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          color: 'error' as const,
          click: () => console.log('Delete user:', row.original.id),
        },
      ]],
    }, {
      default: () => h(UButton, {
        variant: 'ghost',
        color: 'gray',
        icon: 'i-lucide-ellipsis',
      }),
    }),
  },
] satisfies TableColumn<UserWithRole>[]
</script>

<template>
  <AdminPageWrapper title="Users">
    <div class="space-y-4">
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
  </AdminPageWrapper>
</template>
