'use client'

import type { CaseFilters as Filters } from '@/lib/case-types'
import { SelectField } from './ui'

type Props = {
  draft: Filters
  courts: string[]
  codes: string[]
  onChange: (patch: Partial<Filters>) => void
}

/** Grid items for the search form's nine-column grid; rendered as a fragment. */
export function CaseFilters({ draft, courts, codes, onChange }: Props) {
  return (
    <>
      <SelectField
        id="filter-court"
        label="Court"
        className="md:col-span-5 xl:col-span-3 xl:col-start-1 xl:row-start-2"
        value={draft.court}
        onChange={(court) => onChange({ court })}
        options={[
          { value: '', label: 'All courts' },
          ...courts.map((court) => ({ value: court, label: court })),
        ]}
      />
      <SelectField
        id="filter-code"
        label="Code"
        className="md:col-span-4 xl:col-span-3 xl:col-start-4 xl:row-start-2"
        value={draft.code}
        onChange={(code) => onChange({ code })}
        options={[
          { value: '', label: 'All codes' },
          ...codes.map((code) => ({ value: code, label: code })),
        ]}
      />
      <label className="flex h-12 cursor-pointer items-center gap-3 self-end border-2 border-transparent px-1 text-[14px] font-bold text-ink md:col-span-9 xl:col-span-3 xl:col-start-7 xl:row-start-2">
        <input
          type="checkbox"
          checked={draft.reviewOnly}
          onChange={(event) => onChange({ reviewOnly: event.target.checked })}
          className="size-5 shrink-0 rounded-none border-2 border-ink accent-accent"
        />
        <span className="flex items-center gap-1.5">
          <span className="size-2 bg-accent" aria-hidden="true" />
          Needs review only
        </span>
      </label>
    </>
  )
}
