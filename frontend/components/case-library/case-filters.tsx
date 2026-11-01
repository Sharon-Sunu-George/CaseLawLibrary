'use client'

import type { CaseFilters as Filters } from '@/lib/case-types'
import { SelectField } from './ui'

type Props = {
  draft: Filters
  courts: string[]
  codes: string[]
  onChange: (patch: Partial<Filters>) => void
}

/** Grid items for the search form's filter row; rendered as a fragment. */
export function CaseFilters({ draft, courts, codes, onChange }: Props) {
  return (
    <>
      <SelectField
        id="filter-court"
        label="Court"
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
        value={draft.code}
        onChange={(code) => onChange({ code })}
        options={[
          { value: '', label: 'All codes' },
          ...codes.map((code) => ({ value: code, label: code })),
        ]}
      />
      <div className="flex min-w-0 flex-col gap-2">
        <span className="label-caps text-ink">Review status</span>
        <label className="flex h-12 cursor-pointer items-center gap-3 border border-rule-soft bg-ground px-3 text-[14px] font-medium text-ink transition-colors hover:border-ink">
          <input
            type="checkbox"
            checked={draft.reviewOnly}
            onChange={(event) => onChange({ reviewOnly: event.target.checked })}
            className="size-4 shrink-0 rounded-none border-2 border-ink accent-accent"
          />
          <span className="flex items-center gap-2 text-[14px] font-medium text-ink">
            <span className="size-2 bg-accent" aria-hidden="true" />
            Needs review only
          </span>
        </label>
      </div>
    </>
  )
}
