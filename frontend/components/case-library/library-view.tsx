'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  DEFAULT_FILTERS,
  filtersToQueryString,
  parseFilters,
  searchCases,
  uniqueValues,
} from '@/lib/case-query'
import type { CaseFilters } from '@/lib/case-types'
import { CaseList } from './case-list'
import { CaseSearch } from './case-search'
import { useLibrary } from './library-provider'
import { PageIntroduction } from './page-introduction'
import { EmptyState, ErrorState, LoadingState } from './result-states'
import { ResultsToolbar } from './results-toolbar'

type Phase = 'idle' | 'loading' | 'error'

const SIMULATED_LATENCY_MS = 250

export function LibraryView() {
  const router = useRouter()
  const params = useSearchParams()
  const { cases, setLastQuery } = useLibrary()
  const [phase, setPhase] = useState<Phase>('idle')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<5 | 'all'>(5)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const filters = useMemo(() => parseFilters(params), [params])
  const results = useMemo(() => searchCases(cases, filters), [cases, filters])
  const courts = useMemo(() => uniqueValues(cases, 'court'), [cases])
  const codes = useMemo(() => uniqueValues(cases, 'code'), [cases])

  useEffect(() => {
    setLastQuery(params.toString())
  }, [params, setLastQuery])

  useEffect(() => () => clearTimeout(timer.current), [])

  const writeUrl = useCallback(
    (next: CaseFilters) => {
      const qs = filtersToQueryString(next)
      router.replace(qs ? `/?${qs}` : '/', { scroll: false })
      setCurrentPage(1)
    },
    [router],
  )

  const commitWithLatency = useCallback(
    (next: CaseFilters) => {
      clearTimeout(timer.current)
      setPhase('loading')
      timer.current = setTimeout(() => {
        writeUrl(next)
        setPhase('idle')
      }, SIMULATED_LATENCY_MS)
    },
    [writeUrl],
  )

  const clearAll = useCallback(
    () => commitWithLatency({ ...DEFAULT_FILTERS, sort: filters.sort }),
    [commitWithLatency, filters.sort],
  )

  const retry = () => commitWithLatency(filters)

  const handleTagClick = (tag: string) => {
    commitWithLatency({ ...filters, query: tag })
  }

  // Pagination calculation. "all" shows every matching case without page controls.
  const effectivePageSize =
    pageSize === 'all' ? Math.max(results.length, 1) : (pageSize as number)
  const totalPages = Math.max(1, Math.ceil(results.length / effectivePageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedCases = useMemo(() => {
    if (pageSize === 'all') return results
    const pageSizeNumber = pageSize as number
    const start = (safePage - 1) * pageSizeNumber
    return results.slice(start, start + pageSizeNumber)
  }, [results, safePage, pageSize])

  const appliedKey = filtersToQueryString({ ...filters, sort: DEFAULT_FILTERS.sort })

  return (
    <>
      <PageIntroduction />
      <CaseSearch
        key={appliedKey}
        applied={filters}
        courts={courts}
        codes={codes}
        onSubmit={commitWithLatency}
        onClear={clearAll}
      />

      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="sr-only">
          Results
        </h2>
        <ResultsToolbar
          filters={filters}
          count={results.length}
          totalCount={cases.length}
          searching={phase === 'loading'}
          onRemove={(patch) => writeUrl({ ...filters, ...patch })}
          onClearAll={clearAll}
          onSort={(sort) => writeUrl({ ...filters, sort })}
        />

        {phase === 'loading' && <LoadingState />}
        {phase === 'error' && <ErrorState onRetry={retry} />}
        {phase === 'idle' && results.length === 0 && <EmptyState onReset={clearAll} />}
        {phase === 'idle' && results.length > 0 && (
          <>
            <CaseList
              cases={paginatedCases}
              currentPage={safePage}
              pageSize={pageSize === 'all' ? Math.max(results.length, 1) : pageSize}
              onTagClick={handleTagClick}
            />

            {/* PAGINATION & DISPLAY BAR */}
            {results.length > 5 && (
              <div className="border-b-[1.5px] border-black bg-white px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-neutral-600">
                  <span className="font-extrabold text-black uppercase tracking-[0.1em] text-[10.5px]">
                    SHOWING {(safePage - 1) * (pageSize === 'all' ? results.length : pageSize) + 1}–
                    {Math.min(safePage * (pageSize === 'all' ? results.length : pageSize), results.length)} OF {results.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {pageSize !== 'all' && totalPages > 1 && (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 h-7 border border-black text-[10.5px] font-extrabold uppercase tracking-wider disabled:opacity-35 hover:bg-black hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        PREV
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 h-7 border text-[11px] font-extrabold transition-colors cursor-pointer ${
                            pageNum === safePage
                              ? 'bg-[#D91C1F] border-[#D91C1F] text-white'
                              : 'bg-white border-black text-black hover:bg-neutral-100'
                          }`}
                        >
                          {String(pageNum).padStart(2, '0')}
                        </button>
                      ))}
                      <button
                        type="button"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        className="px-2.5 h-7 border border-black text-[10.5px] font-extrabold uppercase tracking-wider disabled:opacity-35 hover:bg-black hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
                      >
                        NEXT
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setPageSize((prev) => (prev === 5 ? 'all' : 5))
                      setCurrentPage(1)
                    }}
                    className="px-3 h-7 border border-black text-[10.5px] font-extrabold uppercase tracking-[0.1em] text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    {pageSize === 5
                      ? `VIEW ALL (${results.length})`
                      : 'COMPACT VIEW (5 / PAGE)'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  )
}
