import type { CaseRecord } from '@/lib/case-types'
import { CaseResult } from './case-result'

export function CaseList({ cases }: { cases: CaseRecord[] }) {
  return (
    <div>
      <div
        aria-hidden="true"
        className="label-caps hidden border-b-2 border-ink py-3.5 text-ink xl:grid xl:grid-cols-12 xl:gap-x-[var(--dp-spacing-gutter)]"
      >
        <span className="col-span-3 col-start-1">01 / Court & Jurisdiction</span>
        <span className="col-span-6 col-start-4">02 / Case & Summary</span>
        <span className="col-span-3 col-start-10">03 / Code & Date</span>
      </div>
      <ol aria-label="Case results" className="divide-y divide-rule-soft border-b-2 border-ink">
        {cases.map((record, position) => (
          <li
            key={record.id}
            className={`${position % 2 === 1 ? 'bg-[#fafafa]' : 'bg-ground'} transition-colors hover:bg-surface`}
          >
            <CaseResult record={record} index={position + 1} />
          </li>
        ))}
      </ol>
    </div>
  )
}
