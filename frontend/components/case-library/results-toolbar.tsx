'use client'

import { X } from 'lucide-react'
import { SORT_OPTIONS, formatCount, hasActiveFilters } from '@/lib/case-query'
import type { CaseFilters, SortKey } from '@/lib/case-types'
import { SelectField } from './ui'

type Props = {
  filters: CaseFilters
  count: number
  searching: boolean
  onRemove: (patch: Partial<CaseFilters>) => void
  onClearAll: () => void
  onSort: (sort: SortKey) => void
}

export function ResultsToolbar({
  filters,
  count,
  searching,
  onRemove,
  onClearAll,
  onSort,
}: Props) {
  const chips: { key: string; label: string; patch: Partial<CaseFilters> }[] = []
  if (filters.query.trim())
    chips.push({ key: 'q', label: `Search: “${filters.query.trim()}”`, patch: { query: '' } })
  if (filters.court)
    chips.push({ key: 'court', label: `Court: ${filters.court}`, patch: { court: '' } })
  if (filters.code)
    chips.push({ key: 'code', label: `Code: ${filters.code}`, patch: { code: '' } })
  if (filters.reviewOnly)
    chips.push({ key: 'review', label: 'Needs review only', patch: { reviewOnly: false } })

  return (
    <div className="grid swiss-cols gap-y-4">
      <div className="min-w-0 md:col-span-3">
        <p className="label-caps flex items-center gap-2 text-ink">
          <span className="size-2 bg-accent" aria-hidden="true" />
          <span className="font-black text-ink">03</span>
          <span className="text-ink-subtle">Results Index</span>
        </p>
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-2 break-words text-[clamp(2rem,3.5vw,2.75rem)] font-[850] leading-none tracking-[-0.04em] text-ink"
        >
          {searching ? 'Searching…' : formatCount(count)}
          {!searching && !hasActiveFilters(filters) && (
            <span className="mt-2 block text-[13px] font-medium tracking-normal text-ink-subtle">
              indexed cases in library
            </span>
          )}
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-x-[var(--dp-spacing-gutter)] gap-y-4 md:col-span-9 md:grid-cols-9">
        {chips.length > 0 && (
          <ul
            className="flex min-w-0 flex-wrap content-start items-center gap-2 md:col-span-9 xl:col-span-6 xl:col-start-1 xl:row-start-1"
            aria-label="Active filters"
          >
            {chips.map((chip) => (
              <li key={chip.key} className="max-w-full">
                <button
                  type="button"
                  onClick={() => onRemove(chip.patch)}
                  aria-label={`Remove filter ${chip.label}`}
                  className="inline-flex min-h-9 max-w-full items-center gap-2 border-2 border-ink bg-ink px-3 py-1 text-left text-[12px] font-extrabold uppercase tracking-wide text-ground hover:bg-accent hover:border-accent hover:text-ground transition-colors"
                >
                  <span className="min-w-0 break-words">{chip.label}</span>
                  <X className="size-3.5 shrink-0" strokeWidth={3} aria-hidden="true" />
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={onClearAll}
                className="inline-flex min-h-9 items-center px-1 text-[12px] font-extrabold uppercase tracking-wider text-accent underline decoration-2 underline-offset-4 hover:text-ink transition-colors"
              >
                Clear all filters
              </button>
            </li>
          </ul>
        )}

        <SelectField
          id="sort-select"
          label="Sort order"
          className="md:col-span-5 xl:col-span-3 xl:col-start-7 xl:row-start-1"
          value={filters.sort}
          onChange={(sort) => onSort(sort as SortKey)}
          options={SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
        />
      </div>
    </div>
  )
}
