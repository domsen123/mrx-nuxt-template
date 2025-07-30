<script lang="ts" setup>
import { yikes } from '#imports'
import z from 'zod'

useSeoMeta({
  title: 'Profile Settings',
})

const authStore = useAuthStore()
const { currentUser } = storeToRefs(authStore)

const newAvatar = ref<File | null>(null)

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatar: z.string().optional(),
})

type Schema = z.infer<typeof schema>
const state = reactive<Schema>({
  name: currentUser.value?.name || '',
  avatar: currentUser.value?.image || '',
})

const isDirty = computed(() => {
  return state.name !== currentUser.value?.name
    || (newAvatar.value)
})

const onSubmit: YikesHandler<Schema> = {
  submit: async (event) => {
    const payload = event.data
    if (payload.name !== currentUser.value?.name) {
      await authStore.updateName(payload.name)
    }
    if (newAvatar.value) {
      await authStore.updateAvatar(newAvatar.value)
    }
  },
}

const fileRef = ref<HTMLInputElement>()
const onFileChange = (e: Event) => {
  console.log('onFileChange', e)
  const input = e.target as HTMLInputElement

  if (!input.files?.length) {
    return
  }
  newAvatar.value = input.files[0]!
  state.avatar = URL.createObjectURL(newAvatar.value)
}

const onFileClick = () => {
  fileRef.value?.click()
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
      <USeparator />
      <UFormField
        name="avatar"
        label="Avatar"
        description="JPG, GIF or PNG. 1MB Max."
        class="flex max-sm:flex-col justify-between sm:items-center gap-4"
      >
        <div class="flex flex-wrap items-center gap-3">
          <template v-if="newAvatar">
            <UAvatar
              v-if="state.avatar"
              :src="state.avatar"
              :alt="state.name"
              size="lg"
            />
          </template>
          <AppAvatar v-else-if="currentUser" :user-id="currentUser.id" size="lg" />

          <UButton
            label="Choose"
            color="neutral"
            @click="onFileClick"
          />
          <input
            ref="fileRef"
            type="file"
            class="hidden"
            accept=".jpg, .jpeg, .png, .gif"
            @change="onFileChange"
          >
        </div>
      </UFormField>

      <div class="flex justify-end">
        <UButton type="submit" color="primary" label="Save Changes" :disabled="!isDirty" :loading="args?.loading" />
      </div>
    </UPageCard>
  </UForm>
</template>

<style></style>
