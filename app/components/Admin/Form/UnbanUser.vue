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

// Use mutation from store
const { useUnbanUser } = useAdminStore()
const { mutate: unbanUser, isLoading, error: mutationError, status } = useUnbanUser()

const error = ref<string | null>(null)

// Watch for mutation errors
watch(mutationError, (newError) => {
  if (newError) {
    error.value = newError.message || 'Failed to unban user'
  }
})

// // Watch for mutation success
watch(status, (newStatus) => {
  if (newStatus === 'success') {
    emit('success')
  }
})

// Reset error when component mounts
onMounted(() => {
  error.value = null
})

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
const handleSubmit = () => {
  if (!props.user)
    return

  error.value = null

  unbanUser({
    userId: props.user.id,
  })
}
</script>

<template>
  <div v-if="user" class="space-y-4">
    <!-- User Info Card -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
      color="info"
      icon="i-lucide-info"
      title="Confirmation"
      description="Are you sure you want to unban this user? They will immediately regain access to their account."
    />

    <!-- Error Message -->
    <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :title="error" />

    <!-- Actions -->
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
        color="primary"
        :loading="isLoading"
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
