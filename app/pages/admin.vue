<script lang="ts" setup>
definePageMeta({
  middleware: [
    'is-admin',
  ],
})
</script>

<template>
  <NuxtPage />
</template>
