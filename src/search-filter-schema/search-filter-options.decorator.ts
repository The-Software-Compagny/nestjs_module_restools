import { BadRequestException, ExecutionContext, Logger, createParamDecorator } from '@nestjs/common'
import { Request } from 'express'
import { ParsedQs } from 'qs'

export const DEFAULT_SEARCH_OPTIONS = {
  loggerType: 'FilterOptionsControl',
  defaultLimit: 10,
  limitKey: 'limit',
  skipKey: 'skip',
  pageKey: 'page',
  sortKey: 'sort',
  allowUnlimited: false,
}

export interface FilterSearchOptions {
  loggerType?: string
  defaultLimit?: number
  limitKey?: string
  skipKey?: string
  pageKey?: string
  sortKey?: string
  allowUnlimited?: boolean,
}

export interface SortOptions {
  [key: string]: 'asc' | 'desc' | 1 | -1
}

export const DEFAULT_FILTER_OPTIONS = {
  limit: DEFAULT_SEARCH_OPTIONS.defaultLimit,
  skip: 0,
  sort: {},
}

export interface FilterOptions {
  limit: number
  skip: number
  sort: SortOptions
}

/* istanbul ignore next */
export const SearchFilterOptions = createParamDecorator((options: FilterSearchOptions, ctx: ExecutionContext): FilterOptions => {
  options = { ...DEFAULT_SEARCH_OPTIONS, ...options }
  const req = ctx.switchToHttp().getRequest<Request>()

  try {
    return filterOptions(req.query, options)
  } catch (error) {
    throw new BadRequestException(error.message)
  }
})

export function filterOptions(
  queries: string | string[] | ParsedQs | ParsedQs[],
  options?: FilterSearchOptions,
): FilterOptions {
  options = { ...DEFAULT_SEARCH_OPTIONS, ...options }
  let limit = parseInt(`${queries[options.limitKey]}`) || options.defaultLimit
  if (limit === -1 && options.allowUnlimited) limit = undefined
  let skip = parseInt(`${queries[options.skipKey]}`) || 0

  if (queries[options.pageKey]) {
    if (skip > 0) Logger.debug(`Both ${options.skipKey} and ${options.pageKey} are set. ${options.skipKey} will be ignored`, options.loggerType)
    skip = (parseInt(`${queries[options.pageKey]}`) - 1) * limit
  }

  const sort = {}
  for (const key in <string[] | ParsedQs[]>queries[options.sortKey]) {
    switch (`${queries[options.sortKey][key]}`.toLowerCase()) {
      case '1':
      case 'asc':
        sort[key] = 1
        break

      case '-1':
      case 'desc':
        sort[key] = -1
        break
    }
  }

  return {
    limit,
    skip,
    sort,
  }
}
