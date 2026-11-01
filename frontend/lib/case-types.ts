export type CaseRecord = {
  id: string
  title: string
  citation?: string
  caseNumber?: string
  court: string
  jurisdiction: string
  code: string
  /** ISO date, YYYY-MM-DD */
  decisionDate?: string
  decidedDisplay?: string
  bench?: string
  fullNotes?: string
  summary: string
  tags: string[]
  needsReview: boolean
  /** Name of the publication the reference screenshot attributed the record to */
  source?: string
}

export type SortKey = 'date-desc' | 'date-asc' | 'title-asc' | 'court-asc'

export type CaseFilters = {
  query: string
  court: string
  code: string
  reviewOnly: boolean
  sort: SortKey
}

