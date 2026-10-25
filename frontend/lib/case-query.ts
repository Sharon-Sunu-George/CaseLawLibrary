import type { CaseFilters, CaseRecord, SortKey } from './case-types'

export const DEFAULT_FILTERS: CaseFilters = {
  query: '',
  court: '',
  code: '',
  reviewOnly: false,
  sort: 'date-desc',
}

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date-desc', label: 'Decision date, newest first' },
  { value: 'date-asc', label: 'Decision date, oldest first' },
  { value: 'title-asc', label: 'Title, A to Z' },
]

type ParamsReader = { get(name: string): string | null }

export function parseFilters(params: ParamsReader): CaseFilters {
  const sort = params.get('sort')
  return {
    query: params.get('q') ?? '',
    court: params.get('court') ?? '',
    code: params.get('code') ?? '',
    reviewOnly: params.get('review') === '1',
    sort: SORT_OPTIONS.some((option) => option.value === sort)
      ? (sort as SortKey)
      : DEFAULT_FILTERS.sort,
  }
}

export function filtersToQueryString(filters: CaseFilters): string {
  const params = new URLSearchParams()
  if (filters.query.trim()) params.set('q', filters.query.trim())
  if (filters.court) params.set('court', filters.court)
  if (filters.code) params.set('code', filters.code)
  if (filters.reviewOnly) params.set('review', '1')
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  return params.toString()
}

export function hasActiveFilters(filters: CaseFilters): boolean {
  return Boolean(
    filters.query.trim() || filters.court || filters.code || filters.reviewOnly,
  )
}

function haystack(record: CaseRecord): string {
  return [
    record.title,
    record.citation,
    record.caseNumber,
    record.court,
    record.jurisdiction,
    record.code,
    record.summary,
    ...record.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function searchCases(
  cases: CaseRecord[],
  filters: CaseFilters,
): CaseRecord[] {
  const terms = filters.query.toLowerCase().split(/\s+/).filter(Boolean)

  const matches = cases.filter((record) => {
    if (filters.court && record.court !== filters.court) return false
    if (filters.code && record.code !== filters.code) return false
    if (filters.reviewOnly && !record.needsReview) return false
    if (terms.length === 0) return true
    const text = haystack(record)
    return terms.every((term) => text.includes(term))
  })

  return matches.sort((a, b) => {
    if (filters.sort === 'title-asc') return a.title.localeCompare(b.title)
    // Records without a date always sort last.
    if (!a.decisionDate && !b.decisionDate) return 0
    if (!a.decisionDate) return 1
    if (!b.decisionDate) return -1
    return filters.sort === 'date-asc'
      ? a.decisionDate.localeCompare(b.decisionDate)
      : b.decisionDate.localeCompare(a.decisionDate)
  })
}

export function uniqueValues(
  cases: CaseRecord[],
  key: 'court' | 'code',
): string[] {
  return Array.from(new Set(cases.map((record) => record[key]))).sort((a, b) =>
    a.localeCompare(b),
  )
}

export function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function formatCount(count: number): string {
  return `${count} ${count === 1 ? 'case' : 'cases'}`
}
