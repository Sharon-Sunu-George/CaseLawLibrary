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
  { value: 'title-asc', label: 'Case title, A-Z' },
  { value: 'court-asc', label: 'Court, A-Z' },
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
    record.fullNotes,
    record.source,
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
    if (filters.sort === 'title-asc') {
      const result = a.title.localeCompare(b.title, undefined, {
        sensitivity: 'base',
      })
      return result !== 0 ? result : a.id.localeCompare(b.id)
    }
    if (filters.sort === 'court-asc') {
      const result = a.court.localeCompare(b.court, undefined, {
        sensitivity: 'base',
      })
      return result !== 0 ? result : a.id.localeCompare(b.id)
    }
    // Records without a date always sort last.
    if (!a.decisionDate && !b.decisionDate) {
      return a.id.localeCompare(b.id)
    }
    if (!a.decisionDate) return 1
    if (!b.decisionDate) return -1
    const result = filters.sort === 'date-asc'
      ? a.decisionDate.localeCompare(b.decisionDate)
      : b.decisionDate.localeCompare(a.decisionDate)
    return result !== 0 ? result : a.id.localeCompare(b.id)
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

/* =========================================================================
   Deterministic local case retrieval for "Ask Library"

   This is deliberately not generative AI. It performs weighted field retrieval
   over records already loaded in the browser and only returns data present in
   those records.
   ========================================================================= */

const ASK_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'about',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'the',
  'to',
  'what',
  'which',
  'with',
])

/**
 * Explicit, curated synonym map. This is intentionally small and documented:
 * only abbreviations/policy labels that are conventionally used in these
 * records and for which the expanded form is equally direct.
 */
const ASK_SYNONYM_PHRASES: Array<[string, string]> = [
  ['ni act', 'negotiable instruments act'],
  ['crpc', 'criminal procedure code'],
  ['cpc', 'civil procedure code'],
  ['ni', 'negotiable instruments'],
  ['fir', 'first information report'],
  ['sc', 'supreme court'],
  ['hc', 'high court'],
]

/**
 * Generic legal words are retained as required qualification terms, but their
 * direct relevance contribution is capped to one point. This avoids common
 * words such as "section" and "act" inflating scores across unrelated cases.
 */
const ASK_GENERIC_TERMS = new Set(['section', 'act'])

const ASK_FIELD_WEIGHTS: Record<string, number> = {
  title: 12,
  citation: 12,
  tags: 10,
  code: 8,
  court: 7,
  jurisdiction: 5,
  summary: 5,
  fullNotes: 3,
  source: 2,
}

export type AskMatch = {
  record: CaseRecord
  score: number
  matchedTerms: string[]
  snippet: string
}

function normalizeAskText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function expandAskSynonyms(value: string): string {
  let text = value.toLowerCase()
  for (const [source, target] of ASK_SYNONYM_PHRASES) {
    text = text.replace(new RegExp(`\\b${source}\\b`, 'g'), target)
  }
  return text
}

function tokenizeAskQuery(value: string): string[] {
  const normalized = normalizeAskText(expandAskSynonyms(value))
  return Array.from(
    new Set(
      normalized
        .split(/\s+/)
        .map((term) => term.trim())
        .filter((term) => term.length > 1 && !ASK_STOP_WORDS.has(term)),
    ),
  )
}

function tokenizeAskField(value: string): string[] {
  return normalizeAskText(expandAskSynonyms(value))
    .split(/\s+/)
    .filter(Boolean)
}

function termOccurrences(needle: string, haystackTokens: string[]): number {
  let count = 0
  for (const token of haystackTokens) {
    if (token === needle) count += 1
  }
  return Math.min(count, 3)
}

function buildAskSnippet(record: CaseRecord, queryTokens: string[]): string {
  const snippets: Array<{ text: string; weight: number }> = [
    { text: record.summary, weight: ASK_FIELD_WEIGHTS.summary },
    { text: record.fullNotes || '', weight: ASK_FIELD_WEIGHTS.fullNotes },
    { text: record.title, weight: ASK_FIELD_WEIGHTS.title },
    { text: record.citation || '', weight: ASK_FIELD_WEIGHTS.citation },
    { text: record.court, weight: ASK_FIELD_WEIGHTS.court },
    { text: record.code, weight: ASK_FIELD_WEIGHTS.code },
    { text: record.tags.join(', '), weight: ASK_FIELD_WEIGHTS.tags },
  ].filter((item) => item.text.trim().length > 0)

  let selectedText = snippets[0]?.text ?? ''
  let selectedPosition = Number.POSITIVE_INFINITY

  for (const item of snippets) {
    const lower = item.text.toLowerCase()
    let position = Number.POSITIVE_INFINITY
    for (const token of queryTokens) {
      const found = lower.indexOf(token.toLowerCase())
      if (found !== -1 && found < position) position = found
    }
    if (position < selectedPosition) {
      selectedPosition = position
      selectedText = item.text
    }
  }

  const normalized = selectedText.replace(/\s+/g, ' ').trim()
  if (selectedPosition !== Number.POSITIVE_INFINITY && normalized.length > 220) {
    const start = Math.max(0, selectedPosition - 80)
    const end = Math.min(normalized.length, selectedPosition + 140)
    const prefix = start > 0 ? '...' : ''
    const suffix = end < normalized.length ? '...' : ''
    return `${prefix}${normalized.slice(start, end).trim()}${suffix}`
  }

  return normalized.length > 220
    ? `${normalized.slice(0, 217).trim()}...`
    : normalized
}

export function rankAskResults(
  question: string,
  records: CaseRecord[],
  limit = 6,
): AskMatch[] {
  const queryTokens = tokenizeAskQuery(question)
  if (queryTokens.length === 0) return []

  const normalizedPhrase = normalizeAskText(expandAskSynonyms(question))

  const scored = records
    .map((record) => {
      const fieldSets: Array<[string, string]> = [
        ['title', record.title],
        ['citation', record.citation || record.caseNumber || ''],
        ['tags', record.tags.join(' ')],
        ['code', record.code],
        ['court', record.court],
        ['jurisdiction', record.jurisdiction],
        ['summary', record.summary],
        ['fullNotes', record.fullNotes || ''],
        ['source', record.source || ''],
      ]

      let score = 0
      let anyMatch = false
      const matchedTerms = new Set<string>()

      for (const [fieldName, fieldValue] of fieldSets) {
        const fieldWeight = ASK_FIELD_WEIGHTS[fieldName]
        if (!fieldWeight || fieldValue.trim().length === 0) continue

        const fieldTokens = tokenizeAskField(fieldValue)
        const normalizedFieldValue = normalizeAskText(expandAskSynonyms(fieldValue))

        for (const token of queryTokens) {
          const occurrences = termOccurrences(token, fieldTokens)
          if (occurrences > 0) {
            // Generic legal words remain eligible so a multi-term query must
            // still satisfy them, but they cannot dominate the score.
            const scoringWeight = ASK_GENERIC_TERMS.has(token) ? 1 : fieldWeight
            score += occurrences * scoringWeight
            anyMatch = true
            matchedTerms.add(token)
          }
        }

        if (
          queryTokens.length > 1 &&
          normalizedPhrase.length > 0 &&
          normalizedFieldValue.includes(normalizedPhrase)
        ) {
          score += fieldWeight * 4
          anyMatch = true
        }
      }

      if (!anyMatch || matchedTerms.size !== queryTokens.length) return null

      return {
        record,
        score,
        matchedTerms: Array.from(matchedTerms).sort(),
        snippet: buildAskSnippet(record, queryTokens),
      }
    })
    .filter((item): item is AskMatch => item !== null)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.record.decisionDate && a.record.decisionDate) {
        const dateComparison = b.record.decisionDate.localeCompare(a.record.decisionDate)
        if (dateComparison !== 0) return dateComparison
      }
      if (b.record.decisionDate && !a.record.decisionDate) return -1
      if (!b.record.decisionDate && a.record.decisionDate) return 1
      return a.record.id.localeCompare(b.record.id)
    })

  return scored.slice(0, limit)
}
