<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import * as z from 'zod'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Reset Password',
  description: 'Create a new password',
})

const toast = useToast()
const authClient = useAuthClient()
const route = useRoute()

const fields = [{
  name: 'password',
  label: 'New Password',
  type: 'password' as const,
  placeholder: 'Enter your new password',
  required: true,
}, {
  name: 'confirmPassword',
  label: 'Confirm Password',
  type: 'password' as const,
  placeholder: 'Confirm your new password',
  required: true,
}]

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
})

type Schema = z.output<typeof schema>

const loading = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { password } = payload.data
  const token = route.query.token as string

  if (!token) {
    toast.add({
      title: 'Invalid reset link',
      description: 'The password reset link is invalid or expired.',
      color: 'error',
    })
    return
  }

  loading.value = true
  try {
    await authClient.resetPassword({
      newPassword: password,
      token,
    })
    toast.add({
      title: 'Password reset successful',
      description: 'Your password has been reset. Please sign in with your new password.',
      color: 'success',
    })
    await navigateTo('/auth/login')
  }
  catch (error: any) {
    console.error('Password reset error:', error)
    toast.add({
      title: 'Password reset failed',
      description: error.message || 'An unknown error occurred. Please try again later.',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    title="Reset your password"
    icon="i-lucide-key-round"
    :submit="{ label: 'Reset password' }"
    :validate-on="['change']"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #description>
      Remember your password? <ULink
        to="/auth/login"
        class="text-primary font-medium"
      >
        Sign in
      </ULink>.
    </template>
  </UAuthForm>
</template>
