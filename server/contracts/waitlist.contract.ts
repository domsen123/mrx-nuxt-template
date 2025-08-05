import z from 'zod'

export const createWaitlistDTO = z.object({
  email: z.email().min(1, 'Email is required'),
})
