<script lang="ts" setup>
definePageMeta({
  layout: 'admin',
  middleware: [
    'is-admin',
  ],
})
</script>

<template>
  <NuxtPage />
</template>
