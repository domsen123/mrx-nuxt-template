<script lang="ts" setup>
import { yikes } from '#imports'
import z from 'zod'

useSeoMeta({
  title: 'Profile Settings',
})

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})
type Schema = z.infer<typeof schema>
const state = reactive<Schema>({
  name: currentUser.value?.name || '',
})

const isDirty = computed(() => {
  return state.name !== currentUser.value?.name
})

const onSubmit: YikesHandler<Schema> = {
  submit: async (event) => {
    const payload = event.data
    if (payload.name !== currentUser.value?.name) {
      await authStore.updateName(payload.name)
    }
  },
}
</script>

<template>
  <UForm v-slot="args" :schema="schema" :state="state" class="space-y-4" v-bind="yikes(onSubmit)">
    <UPageCard title="Profile" description="Change your profile" variant="naked" orientation="horizontal" />
    <UPageCard variant="subtle" class="space-y-4">
      <UFormField
        name="name"
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        required
        class="flex max-sm:flex-col justify-between items-start gap-4"
      >
        <UInput
          v-model="state.name"
          autocomplete="off"
          :ui="{ base: 'min-w-xs' }"
        />
      </UFormField>

      <div class="flex justify-end">
        <UButton type="submit" color="primary" label="Save Changes" :disabled="!isDirty" :loading="args?.loading" />
      </div>
    </UPageCard>
  </UForm>
</template>

<style></style>
