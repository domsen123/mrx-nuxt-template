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

const _authClient = useAuthClient()

// Validation schema
const schema = z.object({
  confirmEmail: z.string().email('Please enter a valid email'),
}).refine(data => {
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

const isLoading = ref(false)

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

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.user) return

  isLoading.value = true

  try {
    await _authClient.admin.removeUser({
      userId: props.user.id,
    })

    emit('success')
  }
  catch (error) {
    console.error('Failed to delete user:', error)
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

      <div>
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Account Age</label>
        <p class="text-sm text-gray-900 dark:text-gray-100">
          {{ accountAge }}
        </p>
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