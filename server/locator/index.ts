import type { H3Event } from 'h3'
import type { Hookable } from 'hookable'
import { createHooks } from 'hookable'
import { getDatabase } from '../database'
import { ItemRepository } from '../repositories/item.repository'

let __itemRepository: ItemRepository | undefined
let __hooks: Hookable<Record<string, any>, string> | null = null

export const getHooks = () => {
  if (!__hooks) {
    __hooks = createHooks()
  }
  return __hooks
}

export const getItemRepository = (event?: H3Event) => {
  if (!__itemRepository) {
    __itemRepository = new ItemRepository(
      getDatabase(),
      getHooks(),
      event,
    )
  }
  return __itemRepository
}
