<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import * as z from 'zod'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Register',
  description: 'Create a new account',
})

const toast = useToast()

const fields = [{
  name: 'name',
  type: 'text' as const,
  label: 'Name',
  placeholder: 'Enter your name',
  required: true,
}, {
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
  name: z.string().min(1, { message: 'Please enter your name' }),
  email: z.email('Please enter a valid email address'),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
})

type Schema = z.output<typeof schema>

const loading = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { name, email, password } = payload.data
  const authStore = useAuthStore()
  loading.value = true
  try {
    await authStore.signUpWithEmailAndPassword(name, email, password)
    await navigateTo('/')
  }
  catch (error: any) {
    console.error('Registration error:', error)
    toast.add({
      title: 'Registration failed',
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
    title="Create account"
    icon="i-lucide-user-plus"
    :submit="{ label: 'Register' }"
    :validate-on="['change']"
    :loading="loading"
    @submit="onSubmit"
  >
    <template #description>
      Already have an account? <ULink
        to="/auth/login"
        class="text-primary font-medium"
      >
        Login
      </ULink>.
    </template>
  </UAuthForm>
</template>
