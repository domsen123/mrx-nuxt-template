<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const props = defineProps<{
  user: {
    id: string
    email: string
    name?: string | null
  } | null
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

// Validation schema
const schema = z.object({
  reason: z.string().min(10, 'Please provide a more detailed reason (at least 10 characters)'),
  duration: z.enum(['permanent', 'custom']),
  customDate: z.string().optional(),
}).refine((data) => {
  if (data.duration === 'custom') {
    return data.customDate && data.customDate.length > 0
  }
  return true
}, {
  message: 'Please select a ban expiration date',
  path: ['customDate'],
})

type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  reason: '',
  duration: 'permanent' as 'permanent' | 'custom',
  customDate: '',
})

// Get minimum date (tomorrow)
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Duration options
const durationOptions = [
  {
    label: 'Permanent Ban',
    value: 'permanent',
    description: 'User will be permanently banned',
  },
  {
    label: 'Temporary Ban (select date)',
    value: 'custom',
    description: 'Ban expires on a specific date',
  },
]

// Use mutation from store
const { useBanUser } = useAdminStore()
const { mutate: banUser, isLoading, error: mutationError, status } = useBanUser()

const error = ref<string | null>(null)

// Watch for mutation errors
watch(mutationError, (newError) => {
  if (newError) {
    error.value = newError.message || 'Failed to ban user'
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

  const banData: any = {
    userId: props.user.id,
    reason: event.data.reason.trim(),
  }

  // Add expiration date for temporary bans
  if (event.data.duration === 'custom' && event.data.customDate) {
    const expiresAt = new Date(event.data.customDate)
    expiresAt.setHours(23, 59, 59, 999)
    banData.expiresAt = expiresAt.toISOString()
  }

  banUser(banData)
}
</script>

<template>
  <div v-if="user" class="space-y-4">
    <!-- User Info Card -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-ban" class="w-5 h-5 text-red-600 dark:text-red-400" />
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
      </div>
    </div>

    <!-- Warning Message -->
    <UAlert
      color="warning"
      icon="i-lucide-alert-triangle"
      title="Warning"
      description="Banning this user will prevent them from accessing their account."
    />

    <!-- Error Message -->
    <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :title="error" />

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="Ban Reason" name="reason" required>
        <UTextarea
          v-model="state.reason"
          placeholder="Provide a detailed reason for banning this user..."
          :rows="3"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Ban Duration" name="duration" required>
        <URadioGroup
          v-model="state.duration"
          :items="durationOptions"
          value-key="value"
          class="space-y-3"
        />
      </UFormField>

      <UFormField
        v-if="state.duration === 'custom'"
        label="Ban Expires On"
        name="customDate"
        required
      >
        <UInput
          v-model="state.customDate"
          type="date"
          :min="minDate"
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
          :loading="isLoading"
        >
          Ban User
        </UButton>
      </div>
    </UForm>
  </div>

  <div v-else class="text-center text-gray-500">
    No user selected
  </div>
</template>
