import { BadRequestException, ExecutionContext, Logger, createParamDecorator } from '@nestjs/common'
import dayjs from 'dayjs'
import merge from 'deepmerge'
import { Request } from 'express'
import { ParsedQs } from 'qs'
import { isPlainObject } from 'is-plain-object'

let ObjectId: any
(async () => {
  try {
    const mongooseModule = await import('mongoose')
    ObjectId = mongooseModule.Types.ObjectId
  } catch (error) {
    Logger.debug(`Mongoose module not found`, SearchFilterSchema.name)
  }
})()

export const FILTER_SYMBOL_EQUAL = ':'
export const FILTER_SYMBOL_GREATER = '>'
export const FILTER_SYMBOL_LESS = '<'
export const FILTER_SYMBOL_NOT_EQUAL = '!'
export const FILTER_SYMBOL_IN = '@'
export const FILTER_SYMBOL_REGEX = '^'
export const FILTER_SYMBOL_BOOLEAN = '?'
export const FILTER_SYMBOL_NUMBER = '#'

export const DEFAULT_ALLOWED_FILTERS = [
  FILTER_SYMBOL_EQUAL,
  FILTER_SYMBOL_BOOLEAN,
  FILTER_SYMBOL_NUMBER,
  FILTER_SYMBOL_NOT_EQUAL,
  FILTER_SYMBOL_GREATER,
  FILTER_SYMBOL_LESS,
  FILTER_SYMBOL_REGEX,
  FILTER_SYMBOL_IN,
]

export const DEFAULT_SCHEMA_OPTIONS = {
  loggerType: 'FilterSchemaControl',
  unsafe: false,
  queryKey: 'filters',
  strict: true,
  convertObjectId: true,
}

export interface FilterSchemaOptions {
  loggerType?: string
  dayjsLocale?: string
  unsafe?: boolean
  queryKey?: string
  strict?: boolean
  convertObjectId?: boolean
}

export interface FilterSchema {
  [key: string | number]: FilterSchema
}

/* istanbul ignore next */
export const SearchFilterSchema = createParamDecorator((options: FilterSchemaOptions, ctx: ExecutionContext): FilterSchema => {
  options = { ...DEFAULT_SCHEMA_OPTIONS, ...options }
  const req = ctx.switchToHttp().getRequest<Request>()

  try {
    return filterSchema(req.query[options.queryKey], options)
  } catch (error) {
    throw new BadRequestException(error.message)
  }
})

export function filterSchema(
  filters: string | string[] | ParsedQs | ParsedQs[],
  options?: FilterSchemaOptions,
): FilterSchema {
  options = { ...DEFAULT_SCHEMA_OPTIONS, ...options }
  let conditions = {}
  if (typeof filters === 'object') {
    for (const key of Object.keys(filters)) {
      const data = filters[key]
      conditions = merge(conditions, internalFilterbyType(key, data, DEFAULT_ALLOWED_FILTERS, options), {
        isMergeableObject: isPlainObject,
      })
    }
  }
  return conditions
}

function internalFilterbyType(
  key: string,
  data: string,
  allowed: string[],
  options: FilterSchemaOptions,
) {
  const parsed = {}
  const keyCheck = key.replace(new RegExp(`[${allowed.join('')}]`, 'g'), '')
  if (keyCheck.length === 0 || (!allowed.includes(key[0]) && !/[a-zA-Z0-9-_]/.test(key[0]))) return {}
  switch (key[0]) {
    case FILTER_SYMBOL_BOOLEAN: {
      parsed[key.slice(1)] = /true|on|yes|1/i.test(data)
      break
    }

    case FILTER_SYMBOL_NUMBER: {
      const valueHashtag = Number(data)
      if (isNaN(valueHashtag)) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with number: ${data}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with number: ${data}`, options.loggerType)
        break
      }
      parsed[key.slice(1)] = valueHashtag
      break
    }

    case FILTER_SYMBOL_NOT_EQUAL: {
      const valueExclamation = internalFilterbyType(key.slice(1), data, [
        FILTER_SYMBOL_NUMBER,
        FILTER_SYMBOL_IN,
        FILTER_SYMBOL_EQUAL,
      ], options)
      if (Object.keys(valueExclamation).length === 0) break
      const typeExclamation = Object.keys(valueExclamation[keyCheck])[0]
      if (typeExclamation === '$in') {
        parsed[keyCheck] = { $nin: valueExclamation[keyCheck]['$in'] }
        break
      }
      parsed[keyCheck] = { $ne: valueExclamation[keyCheck] }
      break
    }

    case FILTER_SYMBOL_LESS:
    case FILTER_SYMBOL_GREATER: {
      let upperLowerType = key[0] === FILTER_SYMBOL_GREATER ? '$gt' : '$lt'
      if (key[1] === '|') upperLowerType = `${upperLowerType}e`
      const upperLowerKey = key.slice(upperLowerType.length - 2)
      const valueGreater = internalFiltersByTypeUpperLower(upperLowerType, upperLowerKey, data, options)
      if (Object.keys(valueGreater).length === 0) break
      const subKeyGreater = Object.keys(valueGreater)[0]
      // parsed[subKeyGreater] = { ...parsed[subKeyGreater], ...valueGreater[subKeyGreater] }
      parsed[subKeyGreater] = valueGreater[subKeyGreater]
      break
    }

    case FILTER_SYMBOL_REGEX: {
      const re = data.trim().split('/')
      if (re[0] !== '' || re.length < 3) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with regex: ${data}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with regex: ${data}`, options.loggerType)
        break
      }
      re.shift()
      const $options = re.pop()
      parsed[key.slice(1)] = { $regex: re.join('') }
      if ($options) parsed[key.slice(1)]['$options'] = $options
      break
    }

    case FILTER_SYMBOL_IN: {
      let subKeyAt
      const $in = []
      if (!Array.isArray(data)) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with bad array: ${data}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with bad array: ${data}`, options.loggerType)
        break
      }
      for (const d of data) {
        const valueAt = internalFilterbyType(key.slice(1), d, [FILTER_SYMBOL_NUMBER], options)
        if (Object.keys(valueAt).length === 0) break
        subKeyAt = Object.keys(valueAt)[0]
        $in.push(valueAt[subKeyAt])
      }
      if (!subKeyAt) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with array: ${JSON.stringify(data)}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with array: ${JSON.stringify(data)}`, options.loggerType)
        break
      }
      parsed[subKeyAt] = { $in }
      break
    }

    case FILTER_SYMBOL_EQUAL: {
      if (Array.isArray(data)) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with strict array: ${JSON.stringify(data)}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with strict string: ${JSON.stringify(data)}`, options.loggerType)
        break
      }
      parsed[key.slice(1)] = options.convertObjectId && ObjectId.isValid(data) ? new ObjectId(data) : `${data}`
      break
    }

    default: {
      if (!options.unsafe && Array.isArray(data)) {
        if (options.strict) throw new Error(`Invalid filter key ${keyCheck} with unsafe: ${JSON.stringify(data)}`)
        Logger.verbose(`Invalid filter key ${keyCheck} with unsafe: ${JSON.stringify(data)}`, options.loggerType)
        break
      }
      parsed[key] = data
      break
    }
  }
  return parsed
}

function internalFiltersByTypeUpperLower(
  type: string,
  key: string,
  data: string,
  options?: FilterSchemaOptions,
): FilterSchema {
  const parsed = {}
  if (key[0] !== FILTER_SYMBOL_NUMBER) {
    const dayjsDate = dayjs(data, options.dayjsLocale)
    if (!dayjsDate.isValid() || dayjsDate.toDate().toString() === 'Invalid Date') {
      if (options.strict) throw new Error(`Invalid filter key ${key} with date: ${data}`)
      Logger.verbose(`Invalid filter key ${key} with date: ${data}`, options.loggerType)
      return {}
    }
    parsed[key] = {}
    parsed[key][type] = dayjsDate.toDate()
    return parsed
  }

  const value = internalFilterbyType(key, data, [FILTER_SYMBOL_NUMBER], options)
  if (Object.keys(value).length === 0) return {}

  const subKey = Object.keys(value)[0]
  parsed[subKey] = {}
  parsed[subKey][type] = {}
  parsed[subKey][type] = value[subKey]

  return parsed
}
