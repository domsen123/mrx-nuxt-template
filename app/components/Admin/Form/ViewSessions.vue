<script lang="ts" setup>
import type { Session } from 'better-auth'

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

const authClient = useAuthClient()

// State
const sessions = ref<Session[]>([])
const isLoading = ref(false)
const isRevoking = ref(false)
const error = ref<string | null>(null)

// Fetch user sessions
const fetchSessions = async () => {
  if (!props.user)
    return

  isLoading.value = true
  error.value = null

  const { data, error: fetchError } = await authClient.admin.listUserSessions({
    userId: props.user.id,
  })
  if (fetchError) {
    console.error('Failed to fetch sessions:', fetchError)
    error.value = fetchError instanceof Error ? fetchError.message : 'Failed to fetch sessions'
    isLoading.value = false
    return
  }
  if (data && data.sessions) {
    sessions.value = data.sessions || []
    isLoading.value = false
  }
}

// Revoke individual session
const revokeSession = async (sessionToken: string) => {
  if (!props.user)
    return

  isRevoking.value = true
  error.value = null

  try {
    await authClient.admin.revokeUserSession({
      sessionToken,
    })

    // Remove from local list
    sessions.value = sessions.value.filter(session => session.token !== sessionToken)

    // Show success message
    console.log('Session revoked successfully')
  }
  catch (err) {
    console.error('Failed to revoke session:', err)
    error.value = err instanceof Error ? err.message : 'Failed to revoke session'
  }
  finally {
    isRevoking.value = false
  }
}

// Revoke all sessions
const revokeAllSessions = async () => {
  if (!props.user)
    return

  isRevoking.value = true
  error.value = null

  try {
    // Revoke each session individually
    const revokePromises = sessions.value.map(session =>
      authClient.admin.revokeUserSession({
        sessionToken: session.token,
      }),
    )

    await Promise.all(revokePromises)

    // Clear local list
    sessions.value = []

    // Show success message
    console.log('All sessions revoked successfully')
  }
  catch (err) {
    console.error('Failed to revoke all sessions:', err)
    error.value = err instanceof Error ? err.message : 'Failed to revoke all sessions'
  }
  finally {
    isRevoking.value = false
  }
}

// Format session info
const formatSessionInfo = (session: any) => {
  const parts = []

  if (session.userAgent) {
    // Extract browser info from user agent
    const ua = session.userAgent
    if (ua.includes('Chrome'))
      parts.push('Chrome')
    else if (ua.includes('Firefox'))
      parts.push('Firefox')
    else if (ua.includes('Safari'))
      parts.push('Safari')
    else if (ua.includes('Edge'))
      parts.push('Edge')
    else parts.push('Unknown Browser')

    // Extract OS info
    if (ua.includes('Windows'))
      parts.push('Windows')
    else if (ua.includes('Mac'))
      parts.push('macOS')
    else if (ua.includes('Linux'))
      parts.push('Linux')
    else if (ua.includes('Android'))
      parts.push('Android')
    else if (ua.includes('iOS'))
      parts.push('iOS')
  }

  if (session.ipAddress) {
    parts.push(session.ipAddress)
  }

  return parts.length > 0 ? parts.join(' • ') : 'Unknown Device'
}

// Format last activity
const formatLastActivity = (session: any) => {
  if (!session.updatedAt)
    return 'Unknown'

  const date = new Date(session.updatedAt)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1)
    return 'Just now'
  if (diffMins < 60)
    return `${diffMins} minutes ago`
  if (diffMins < 1440)
    return `${Math.floor(diffMins / 60)} hours ago`
  return `${Math.floor(diffMins / 1440)} days ago`
}

// Load sessions when component mounts
onMounted(() => {
  fetchSessions()
})
</script>

<template>
  <div v-if="user" class="space-y-4">
    <!-- User Info Card -->
    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <UIcon name="i-lucide-activity" class="w-5 h-5 text-blue-600 dark:text-blue-400" />
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

    <!-- Sessions Header -->
    <div class="flex justify-between items-center">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Active Sessions ({{ sessions.length }})
      </h4>

      <UButton
        v-if="sessions.length > 0"
        color="error"
        variant="ghost"
        size="sm"
        :loading="isRevoking"
        :disabled="isRevoking"
        @click="revokeAllSessions"
      >
        Revoke All
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-xl text-gray-400" />
    </div>

    <!-- Sessions List -->
    <div v-else-if="sessions.length > 0" class="space-y-3">
      <div
        v-for="session in sessions"
        :key="session.id"
        class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex justify-between items-start"
      >
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-monitor" class="text-gray-400" />
            <p class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ formatSessionInfo(session) }}
            </p>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400 ml-6">
            Last active: {{ formatLastActivity(session) }}
          </p>

          <p v-if="session.createdAt" class="text-xs text-gray-500 dark:text-gray-400 ml-6">
            Created: {{ new Date(session.createdAt).toLocaleDateString() }}
          </p>
        </div>

        <UButton
          color="error"
          variant="ghost"
          size="sm"
          :loading="isRevoking"
          :disabled="isRevoking"
          @click="revokeSession(session.token)"
        >
          Revoke
        </UButton>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-8">
      <UIcon name="i-lucide-monitor-x" class="text-4xl text-gray-400 mb-2" />
      <p class="text-sm text-gray-500">
        No active sessions found
      </p>
    </div>

    <!-- Error Message -->
    <UAlert v-if="error" color="error" icon="i-lucide-alert-circle" :title="error" />

    <!-- Actions -->
    <div class="flex justify-end gap-3">
      <UButton
        color="neutral"
        variant="ghost"
        :disabled="isLoading || isRevoking"
        @click="emit('cancel')"
      >
        Close
      </UButton>

      <UButton
        :loading="isLoading"
        :disabled="isLoading || isRevoking"
        @click="fetchSessions"
      >
        Refresh
      </UButton>
    </div>
  </div>

  <div v-else class="text-center text-gray-500">
    No user selected
  </div>
</template>
