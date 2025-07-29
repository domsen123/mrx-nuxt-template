<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import * as z from 'zod'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Forgot Password',
  description: 'Reset your password',
})

const { url } = useSiteConfig()
const toast = useToast()
const authClient = useAuthClient()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email address',
  required: true,
}]

const schema = z.object({
  email: z.email('Please enter a valid email address'),
})

type Schema = z.output<typeof schema>

const loading = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { email } = payload.data
  loading.value = true
  try {
    await authClient.forgetPassword({
      email,
      redirectTo: `${url}/auth/reset`,
    })
    toast.add({
      title: 'Password reset email sent',
      description: 'Please check your email for the password reset link.',
      color: 'success',
    })
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
    title="Forgot your password?"
    icon="i-lucide-key"
    :submit="{ label: 'Send reset email' }"
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
