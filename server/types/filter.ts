import type { BaseItem } from './items'

export type FilterOperator = '_eq' | '_ne' | '_gt' | '_lt' | '_gte' | '_lte' | '_in' | '_nin' | '_like' | '_nlike' | '@>' | '?' | '->' | '->>' | string
export type ChainOperator = '_and' | '_or'

export interface Filter {
  filterField: string
  filterOperator: FilterOperator
  filterValue: string | number | boolean | (string | number | boolean)[]
}

export type FilterChain = {
  [K in ChainOperator]?: FilterChain | FilterChain[] | Filter | Filter[]
}

export interface QueryManyParams {
  page?: number | string
  pageSize?: number | string
  search?: {
    fields: string[]
    term: string
  }
  filters?: FilterChain | FilterChain[] | Filter | Filter[]
  orderBy?: string[]
}

export interface QueryManyResult<T = BaseItem> {
  items: T[]
  meta: {
    total: number
    page: number
    pageSize: number
  }
}
