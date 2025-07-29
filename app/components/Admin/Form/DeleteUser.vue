<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const props = defineProps<{
  user: {
    id: string
    email: string
    name?: string | null
    createdAt?: string | null
  } | null
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

// Validation schema
const schema = z.object({
  confirmEmail: z.string().email('Please enter a valid email'),
}).refine((data) => {
  return props.user ? data.confirmEmail === props.user.email : false
}, {
  message: 'Email does not match',
  path: ['confirmEmail'],
})

type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  confirmEmail: '',
})

// Format account age
const accountAge = computed(() => {
  if (!props.user?.createdAt)
    return 'Unknown'

  const created = new Date(props.user.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0)
    return 'Today'
  if (diffDays === 1)
    return '1 day'
  if (diffDays < 30)
    return `${diffDays} days`
  if (diffDays < 365)
    return `${Math.floor(diffDays / 30)} months`
  return `${Math.floor(diffDays / 365)} years`
})

// Use mutation from store
const { useDeleteUser } = useAdminStore()
const { mutate: deleteUser, isLoading, error: mutationError, status } = useDeleteUser()

const error = ref<string | null>(null)

// Watch for mutation errors
watch(mutationError, (newError) => {
  if (newError) {
    error.value = newError.message || 'Failed to delete user'
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
function onSubmit(_event: FormSubmitEvent<Schema>) {
  if (!props.user)
    return

  error.value = null

  deleteUser({
    userId: props.user.id,
  })
}
</script>

<template>
  <div v-if="user" class="space-y-4">
    <!-- User Info Card -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-trash-2" class="w-5 h-5 text-red-600 dark:text-red-400" />
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
        <div class="flex-shrink-0">
          <UBadge :label="accountAge" variant="subtle" color="neutral" />
        </div>
      </div>
    </div>

    <!-- Warning Message -->
    <UAlert
      color="error"
      icon="i-lucide-alert-triangle"
      title="Permanent Action"
    >
      <template #description>
        <div class="space-y-2">
          <p>This action cannot be undone. The following will occur:</p>
          <ul class="list-disc list-inside space-y-1 ml-2">
            <li>User account will be permanently deleted</li>
            <li>All user data will be removed</li>
            <li>Active sessions will be terminated</li>
            <li>User will lose access immediately</li>
          </ul>
        </div>
      </template>
    </UAlert>

    <!-- Error Message -->
    <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :title="error" />

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField
        label="Type user email to confirm deletion"
        name="confirmEmail"
        required
      >
        <UInput
          v-model="state.confirmEmail"
          type="email"
          :placeholder="user.email"
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
          color="error"
          variant="solid"
          :loading="isLoading"
          :disabled="state.confirmEmail !== user.email"
        >
          Delete User Permanently
        </UButton>
      </div>
    </UForm>
  </div>

  <div v-else class="text-center text-gray-500">
    No user selected
  </div>
</template>
