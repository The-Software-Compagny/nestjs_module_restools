import { DEFAULT_FILTER_OPTIONS, filterOptions } from "./search-filter-options.decorator"

describe('search-filter-options', () => {
  it('should work', () => {
    expect(true).toBe(true)
  })

  it('sort with desc string', () => {
    expect(
      filterOptions({
        sort: { 'metadata.lastUpdatedAt': 'desc' },
      }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      sort: { 'metadata.lastUpdatedAt': -1 },
    })
  })

  it('sort with desc number', () => {
    expect(
      filterOptions({
        sort: { 'metadata.lastUpdatedAt': '-1' },
      }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      sort: { 'metadata.lastUpdatedAt': -1 },
    })
  })

  it('sort with asc string', () => {
    expect(
      filterOptions({
        sort: { 'metadata.lastUpdatedAt': 'asc' },
      }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      sort: { 'metadata.lastUpdatedAt': 1 },
    })
  })

  it('sort with asc number', () => {
    expect(
      filterOptions({
        sort: { 'metadata.lastUpdatedAt': '1' },
      }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      sort: { 'metadata.lastUpdatedAt': 1 },
    })
  })

  it('limit 69', () => {
    expect(
      filterOptions({
        limit: '69',
      }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      limit: 69,
    })
  })

  it('skip 71', () => {
    expect(
      filterOptions({
        skip: '71',
      }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      skip: 71,
    })
  })

  it('skip with other key', () => {
    expect(
      filterOptions({
        jump: '71',
      }, { skipKey: 'jump' }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      skip: 71,
    })
  })

  it('limit with other key', () => {
    expect(
      filterOptions({
        quota: '71',
      }, { limitKey: 'quota' }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      limit: 71,
    })
  })

  it('use pagination number', () => {
    expect(
      filterOptions({
        page: '42',
      }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      skip: DEFAULT_FILTER_OPTIONS.limit * 41,
    })
  })

  it('use pagination number with other key', () => {
    expect(
      filterOptions({
        increment: '11',
      }, { pageKey: 'increment' }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      skip: DEFAULT_FILTER_OPTIONS.limit * 10,
    })
  })

  it('use pagination number and conflict with skip', () => {
    expect(
      filterOptions({
        page: '5',
        skip: '50',
      }),
    ).toStrictEqual({
      ...DEFAULT_FILTER_OPTIONS,
      skip: DEFAULT_FILTER_OPTIONS.limit * 4,
    })
  })
})
