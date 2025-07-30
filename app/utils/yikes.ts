import type { FormSubmitEvent } from '#ui/types'

// it called yikes because thats why!

export interface YikesHandler<Schema> {
  submit: (event: FormSubmitEvent<Schema>) => Promise<any>
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export const yikes = <Schema>({ submit, onSuccess, onError }: YikesHandler<Schema>) => {
  const loading = ref(false)
  const onSubmit = (event: FormSubmitEvent<Schema>) => {
    loading.value = true
    return submit(event)
      .then((data) => {
        loading.value = false
        onSuccess?.(data)
      })
      .catch((error) => {
        console.error('Error:', error)
        onError?.(error)
      })
      .finally(() => {
        loading.value = false
      })
  }

  return {
    disabled: loading.value,
    loading,
    onSubmit,
  }
}
