<script lang="ts" setup>
import type { TableColumn } from '#ui/types'

const { useListItems } = useItemStore()

const { data, isLoading } = useListItems<WaitlistItem>(ref('waitlist'), {
  searchFields: ['email'],
})

const columns: TableColumn<WaitlistItem>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.getValue('email'),
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
]
</script>

<template>
  <AdminPageWrapper title="Waitlist">
    <div>
      <UTable
        :columns="columns"
        :data="data?.items"
        :loading="isLoading"
        class="w-full"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <UIcon name="i-lucide-users" class="text-4xl text-gray-400" />
            <p class="text-sm text-gray-500">
              No waitlist entries found
            </p>
          </div>
        </template>
      </UTable>
    </div>
  </AdminPageWrapper>
</template>

<style></style>
