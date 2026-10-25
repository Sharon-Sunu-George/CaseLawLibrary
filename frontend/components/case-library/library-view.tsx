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

const SIMULATED_LATENCY_MS = 400

export function LibraryView() {
  const router = useRouter()
  const params = useSearchParams()
  const { cases, setLastQuery } = useLibrary()
  const [phase, setPhase] = useState<Phase>('idle')
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
    },
    [router],
  )

  // Search and Clear simulate a short round trip so loading is a real state.
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
        <div className="border-b-2 border-ink">
          <div className="frame py-6">
            <ResultsToolbar
              filters={filters}
              count={results.length}
              searching={phase === 'loading'}
              onRemove={(patch) => writeUrl({ ...filters, ...patch })}
              onClearAll={clearAll}
              onSort={(sort) => writeUrl({ ...filters, sort })}
            />
          </div>
        </div>

        <div className="frame pb-16">
          {phase === 'loading' && <LoadingState />}
          {phase === 'error' && <ErrorState onRetry={retry} />}
          {phase === 'idle' && results.length === 0 && <EmptyState onReset={clearAll} />}
          {phase === 'idle' && results.length > 0 && <CaseList cases={results} />}

          <p className="mt-6 text-[13px] text-ink-muted">
            Prototype tool:{' '}
            <button
              type="button"
              onClick={() => setPhase('error')}
              className="font-bold text-ink underline decoration-2 underline-offset-4 hover:bg-ink hover:text-ground"
            >
              Preview the error state
            </button>
          </p>
        </div>
      </section>
    </>
  )
}
