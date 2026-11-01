'use client'

import { X } from 'lucide-react'
import { SORT_OPTIONS, formatCount, hasActiveFilters } from '@/lib/case-query'
import type { CaseFilters, SortKey } from '@/lib/case-types'

type Props = {
  filters: CaseFilters
  count: number
  totalCount: number
  searching: boolean
  onRemove: (patch: Partial<CaseFilters>) => void
  onClearAll: () => void
  onSort: (sort: SortKey) => void
}

export function ResultsToolbar({
  filters,
  count,
  totalCount,
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
    <div>
      <section
        aria-label="Results Summary and Sort"
        className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black"
      >
        {/* Left Section Rail 03 */}
        <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-3 md:py-5 bg-white">
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
            <div>03 /</div>
            <div>RESULTS</div>
            <div>INDEX</div>
          </div>
        </div>

        {/* High-Contrast Black Results Bar */}
        <div className="bg-[#0A0A0A] text-white px-5 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-8 sm:gap-16">
            <div>
              <div
                role="status"
                aria-live="polite"
                className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.03em] leading-none text-white"
              >
                {searching ? 'Searching…' : `${count} ${count === 1 ? 'case' : 'cases'}`}
              </div>
              <div className="text-[12px] text-neutral-300 mt-1.5">
                {hasActiveFilters(filters)
                  ? `Matching records (of ${totalCount} indexed)`
                  : 'Indexed cases in library'}
              </div>
            </div>
            <div className="hidden md:block w-[1px] h-12 bg-neutral-600" aria-hidden="true" />
          </div>

          {/* Sort By Dropdown */}
          <div className="w-full sm:w-auto">
            <label
              htmlFor="sort-cases-select"
              className="block text-[10px] font-extrabold tracking-[0.14em] uppercase text-neutral-300 mb-1.5"
            >
              SORT BY
            </label>
            <div className="relative">
              <select
                id="sort-cases-select"
                value={filters.sort}
                onChange={(e) => onSort(e.target.value as SortKey)}
                className="w-full sm:min-w-[238px] h-9 px-3.5 pr-9 bg-white text-black text-[12.5px] font-medium appearance-none focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <svg
                className="w-3.5 h-3.5 text-black pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden="true"
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Active Filter Chips bar if any */}
      {chips.length > 0 && (
        <div
          className="bg-neutral-100 border-b-[1.5px] border-black px-5 sm:px-8 py-2.5 flex flex-wrap items-center gap-2 text-xs"
          aria-label="Active filters"
        >
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mr-1">
            Active:
          </span>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => onRemove(chip.patch)}
              aria-label={`Remove filter ${chip.label}`}
              className="inline-flex items-center gap-1.5 bg-white border border-black px-2.5 py-1 text-[11px] font-bold text-black hover:bg-[#D91C1F] hover:border-[#D91C1F] hover:text-white transition-colors cursor-pointer"
            >
              <span>{chip.label}</span>
              <X className="w-3 h-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-extrabold uppercase tracking-wider text-[#D91C1F] underline underline-offset-2 ml-2 hover:text-black cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
