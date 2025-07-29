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
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
})

type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.user)
    return

  isLoading.value = true

  try {
    await _authClient.admin.setUserPassword({
      userId: props.user.id,
      newPassword: event.data.password,
    })

    emit('success')
  }
  catch (error) {
    console.error('Failed to set user password:', error)
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

    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UFormField label="New Password" name="password" required>
        <UInput
          v-model="state.password"
          type="password"
          placeholder="Enter new password"
          class="w-full"
        />
      </UFormField>

      <UFormField label="Confirm Password" name="confirmPassword" required>
        <UInput
          v-model="state.confirmPassword"
          type="password"
          placeholder="Confirm new password"
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
        >
          Update Password
        </UButton>
      </div>
    </UForm>
  </div>

  <div v-else class="text-center text-gray-500">
    No user selected
  </div>
</template>
