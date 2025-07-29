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

// Validation schema
const schema = z.object({
  role: z.enum(['user', 'admin']),
})

type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  role: (props.user?.role as 'user' | 'admin') || 'user',
})

// Available roles
const roles = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
]

// Use mutation from store
const { useSetUserRole } = useAdminStore()
const { mutate: setUserRole, isLoading, error: mutationError, status } = useSetUserRole()

const error = ref<string | null>(null)

// Watch for mutation errors
watch(mutationError, (newError) => {
  if (newError) {
    error.value = newError.message || 'Failed to set user role'
  }
})

// Watch for mutation success
watch(status, (newStatus) => {
  if (newStatus === 'success') {
    emit('success')
  }
})

// Reset error when component mounts
onMounted(() => {
  error.value = null
})

// Handle form submission
function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.user)
    return

  error.value = null

  setUserRole({
    userId: props.user.id,
    role: event.data.role,
  })
}
</script>

<template>
  <div v-if="user" class="space-y-4">
    <!-- User Info Card -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-primary-100 dark:bg-primary-800 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-user" class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {{ user.name || 'Unnamed User' }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
            {{ user.email }}
          </p>
        </div>
        <div v-if="user.role" class="flex-shrink-0">
          <UBadge :label="user.role" variant="subtle" color="primary" />
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :title="error" />

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
