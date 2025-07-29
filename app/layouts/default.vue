<script lang="ts" setup>

</script>

<template>
  <div class="relative">
    <UHeader>
      <template #right>
        <UserMenu class="max-w-56" />
      </template>
    </UHeader>
    <UMain>
      <slot />
    </UMain>
  </div>
</template>

<style></style>
