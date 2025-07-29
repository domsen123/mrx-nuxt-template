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

const _authClient = useAuthClient()

// Validation schema
const schema = z.object({
  reason: z.string().min(10, 'Please provide a more detailed reason (at least 10 characters)'),
  duration: z.enum(['permanent', 'custom']),
  customDate: z.string().optional(),
}).refine(data => {
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

const isLoading = ref(false)

// Get minimum date (tomorrow)
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

// Duration options
const durationOptions = [
  { value: 'permanent', label: 'Permanent Ban' },
  { value: 'custom', label: 'Temporary Ban (select date)' },
]

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.user) return

  isLoading.value = true

  try {
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

    await _authClient.admin.banUser(banData)

    emit('success')
  }
  catch (error) {
    console.error('Failed to ban user:', error)
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
    </div>

    <!-- Warning Message -->
    <UAlert
      color="warning"
      icon="i-lucide-alert-triangle"
      title="Warning"
      description="Banning this user will prevent them from accessing their account."
    />

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
          :options="durationOptions"
          class="w-full"
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