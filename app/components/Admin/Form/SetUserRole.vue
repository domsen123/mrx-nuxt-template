<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const props = defineProps<{
  user: {
    id: string
    email: string
    name?: string | null
    role?: string | null
  } | null
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const _authClient = useAuthClient()

// Validation schema
const schema = z.object({
  role: z.enum(['user', 'admin']),
})

type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  role: (props.user?.role as 'user' | 'admin') || 'user',
})

const isLoading = ref(false)

// Available roles
const roles = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
]

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.user)
    return

  isLoading.value = true

  try {
    await _authClient.admin.setRole({
      userId: props.user.id,
      role: event.data.role,
    })

    emit('success')
  }
  catch (error) {
    console.error('Failed to set user role:', error)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div v-if="user" class="space-y-4">
    <!-- User Info -->
    <div class="space-y-2">
      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
        <p class="text-sm text-gray-900 dark:text-gray-100">
          {{ user.email }}
        </p>
      </div>

      <div v-if="user.name">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <p class="text-sm text-gray-900 dark:text-gray-100">
          {{ user.name }}
        </p>
      </div>

      <div v-if="user.role">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Current Role</label>
        <p class="text-sm text-gray-900 dark:text-gray-100">
          {{ user.role }}
        </p>
      </div>
    </div>

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="New Role" name="role" required>
        <USelectMenu
          v-model="state.role"
          :items="roles"
          value-key="value"
          label-key="label"
          class="w-full"
        />
      </UFormField>

      <div class="flex justify-end gap-3">
        <UButton
          color="neutral"
          variant="ghost"
          :disabled="isLoading"
          @click="emit('cancel')"
        >
          Cancel
        </UButton>

        <UButton
          type="submit"
          :loading="isLoading"
          :disabled="state.role === user.role"
        >
          Update Role
        </UButton>
      </div>
    </UForm>
  </div>

  <div v-else class="text-center text-gray-500">
    No user selected
  </div>
</template>
