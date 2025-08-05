import { createWaitlistDTO } from '~~/server/contracts/waitlist.contract'
import { getItemRepository } from '~~/server/locator'

export default defineEventHandler({
  handler: async (event) => {
    const body = await readValidatedBody(event, createWaitlistDTO.parse)

    const repo = getItemRepository()

    await repo.collection('waitlist').insertOne(body)
  },
})
