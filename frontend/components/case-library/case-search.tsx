'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import type { CaseFilters as Filters } from '@/lib/case-types'
import { CaseFilters } from './case-filters'
import { controlClass, primaryButtonClass, secondaryButtonClass } from './ui'

type Props = {
  applied: Filters
  courts: string[]
  codes: string[]
  onSubmit: (draft: Filters) => void
  onClear: () => void
}

/**
 * Edits are held as a draft and applied together when the form is submitted
 * (Enter in the field or the Search button), so every control behaves alike.
 * The parent remounts this component when the applied filters change.
 *
 * Layout: the controls sit in a nine-column grid that spans columns 4-12 of the
 * page grid, so the field, selects and buttons line up with the case rows below.
 */
export function CaseSearch({ applied, courts, codes, onSubmit, onClear }: Props) {
  const [draft, setDraft] = useState<Filters>(applied)

  const update = (patch: Partial<Filters>) =>
    setDraft((current) => ({ ...current, ...patch }))

  return (
    <section aria-labelledby="search-heading" className="border-b-2 border-ink bg-ground">
      <form
        role="search"
        className="frame grid swiss-cols gap-y-4 py-8"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(draft)
        }}
      >
        <div className="md:col-span-3 md:pt-1">
          <h2 id="search-heading" className="label-caps flex items-center gap-2 text-ink">
            <span className="size-2 bg-accent" aria-hidden="true" />
            <span className="font-black text-ink">02</span>
            <span className="text-ink-subtle">Search & Filter</span>
            <span className="sr-only"> cases</span>
          </h2>
          <p className="mt-2 hidden text-[13px] leading-[1.4] text-ink-subtle md:block">
            Filter by keyword, court jurisdiction, or statute.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-1 gap-x-[var(--dp-spacing-gutter)] gap-y-5 md:col-span-9 md:grid-cols-9">
          <div className="relative md:col-span-9 xl:col-span-6 xl:col-start-1 xl:row-start-1">
            <label htmlFor="case-search" className="label-caps mb-2 block text-ink">
              Keyword Query
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                strokeWidth={2.5}
                className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-ink"
              />
              <input
                id="case-search"
                type="search"
                value={draft.query}
                onChange={(event) => update({ query: event.target.value })}
                placeholder="Search case title, citation, court, or legal topics…"
                autoComplete="off"
                className={`${controlClass} h-12 pl-11 text-[16px]`}
              />
            </div>
          </div>

          <div className="flex flex-col justify-end gap-2.5 md:col-span-9 xl:col-span-3 xl:col-start-7 xl:row-start-1">
            <span className="label-caps mb-2 hidden text-ink-subtle xl:block xl:invisible">Actions</span>
            <div className="flex gap-2.5">
              <button
                type="submit"
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-none border-2 border-accent bg-accent px-6 text-[13px] font-extrabold uppercase tracking-wider text-ground hover:bg-[#a60000] hover:border-[#a60000] active:bg-[#850000] active:border-[#850000] transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft({ ...applied, query: '', court: '', code: '', reviewOnly: false })
                  onClear()
                }}
                className={`${secondaryButtonClass} flex-1`}
              >
                Clear
              </button>
            </div>
          </div>

          <CaseFilters draft={draft} courts={courts} codes={codes} onChange={update} />
        </div>
      </form>
    </section>
  )
}
