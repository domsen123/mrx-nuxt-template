<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import * as z from 'zod'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Login',
  description: 'Sign in to your account',
})

const toast = useToast()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email address',
  required: true,
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password',
  required: true,
}]

const schema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string(),
})

type Schema = z.output<typeof schema>

const loading = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { email, password } = payload.data
  const authStore = useAuthStore()
  loading.value = true
  try {
    await authStore.loginWithEmailAndPassword(email, password)
    await navigateTo('/')
  }
  catch (error: any) {
    console.error('Login error:', error)
    toast.add({
      title: 'Login failed',
      description: 'An unknown error occurred. Please try again later.',
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
    title="Welcome back"
    icon="i-lucide-lock"
    :submit="{ label: 'Sign in' }"
    :validate-on="['change']"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account? <ULink
        to="/auth/register"
        class="text-primary font-medium"
      >
        Sign up
      </ULink>.
    </template>
  </UAuthForm>
</template>
