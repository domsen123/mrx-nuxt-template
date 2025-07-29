<script lang="ts" setup>
const props = defineProps<{
  user: {
    id: string
    email: string
    name?: string | null
    banned?: boolean | null
    banReason?: string | null
    banExpires?: string | null
  } | null
}>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const _authClient = useAuthClient()

// Form state
const isLoading = ref(false)
const error = ref<string | null>(null)

// Format ban expiration date
const formattedBanExpires = computed(() => {
  if (!props.user?.banExpires)
    return 'Permanent'

  const date = new Date(props.user.banExpires)
  return Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
})

// Check if ban is expired
const isBanExpired = computed(() => {
  if (!props.user?.banExpires)
    return false
  return new Date(props.user.banExpires) < new Date()
})

// Handle form submission
const handleSubmit = async () => {
  if (!props.user)
    return

  isLoading.value = true
  error.value = null

  try {
    await _authClient.admin.unbanUser({
      userId: props.user.id,
    })

    emit('success')
  }
  catch (err) {
    console.error('Failed to unban user:', err)
    error.value = err instanceof Error ? err.message : 'Failed to unban user'
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

    <!-- Ban Information -->
    <div class="space-y-3">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Ban Information
      </h4>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Ban Reason</label>
          <p class="text-sm text-gray-900 dark:text-gray-100">
            {{ user.banReason || 'No reason provided' }}
          </p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Ban Duration</label>
          <p class="text-sm text-gray-900 dark:text-gray-100">
            {{ formattedBanExpires }}
            <span v-if="isBanExpired" class="text-yellow-600 dark:text-yellow-400 ml-2">
              (Expired)
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- Confirmation Message -->
    <UAlert
      color="blue"
      icon="i-lucide-info"
      title="Confirmation"
      description="Are you sure you want to unban this user? They will immediately regain access to their account."
    />

    <!-- Error Message -->
    <UAlert v-if="error" color="red" icon="i-lucide-alert-circle" :title="error" />

    <!-- Actions -->
    <div class="flex justify-end gap-3">
      <UButton
        color="gray"
        variant="ghost"
        :disabled="isLoading"
        @click="emit('cancel')"
      >
        Cancel
      </UButton>

      <UButton
        color="primary"
        :loading="isLoading"
        :disabled="isLoading"
        @click="handleSubmit"
      >
        Unban User
      </UButton>
    </div>
  </div>

  <div v-else class="text-center text-gray-500">
    No user selected
  </div>
</template>
