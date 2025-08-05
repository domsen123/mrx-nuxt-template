import type { BaseItem } from '~~/server/types/items'

export interface WaitlistItem extends BaseItem {
  email: string
}
