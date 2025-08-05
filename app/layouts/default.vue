<script lang="ts" setup>
const authStore = useAuthStore()
</script>

<template>
  <div class="relative">
    <UHeader>
      <template #right>
        <UserMenu v-if="authStore.isAuthenticated" class="max-w-56" />
        <template v-else>
          <UButton to="/auth/register" label="Sign Up" variant="ghost" />
          <UButton to="/auth/login" label="Sign In" variant="subtle" />
        </template>
      </template>
    </UHeader>
    <UMain>
      <slot />
    </UMain>
  </div>
</template>

<style></style>
