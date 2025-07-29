<script lang="ts" setup>
import type { FormSubmitEvent } from '#ui/types'
import { z } from 'zod'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const _authClient = useAuthClient()

// Validation schema
const schema = z.object({
  email: z.email('Invalid email'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['user', 'admin']),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
})

type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
  role: 'user' as 'user' | 'admin',
})

const isLoading = ref(false)

// Available roles
const roles = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
]

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true

  try {
    await _authClient.admin.createUser({
      email: event.data.email,
      password: event.data.password,
      name: event.data.name,
      role: event.data.role,
    })

    emit('success')
  }
  catch (error) {
    console.error('Failed to create user:', error)
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField label="Email" name="email" required>
      <UInput v-model="state.email" type="email" placeholder="user@example.com" class="w-full" />
    </UFormField>

    <UFormField label="Full Name" name="name" required>
      <UInput v-model="state.name" type="text" placeholder="John Doe" class="w-full" />
    </UFormField>

    <UFormField label="Password" name="password" required>
      <UInput v-model="state.password" type="password" placeholder="Enter password" class="w-full" />
    </UFormField>

    <UFormField label="Confirm Password" name="confirmPassword" required>
      <UInput v-model="state.confirmPassword" type="password" placeholder="Confirm password" class="w-full" />
    </UFormField>

    <UFormField label="Role" name="role" required>
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
      >
        Create User
      </UButton>
    </div>
  </UForm>
</template>
