<script lang="ts" setup>
const { useListUsers } = useAdminStore()

const { data, isPending } = useListUsers()
</script>

<template>
  <AdminPageWrapper title="Users">
    <div>
      <!-- TABLE COMPONENT HERE -->
    </div>
  </AdminPageWrapper>
</template>
