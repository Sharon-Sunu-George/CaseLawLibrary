'use client'

import type { CaseRecord } from '@/lib/case-types'
import { CaseResult } from './case-result'

type Props = {
  cases: CaseRecord[]
  currentPage: number
  pageSize: number
  onTagClick?: (tag: string) => void
}

export function CaseList({ cases, currentPage, pageSize, onTagClick }: Props) {
  return (
    <div>
      {/* THREE-COLUMN CASE RECORDS TABLE HEADER */}
      <div
        role="row"
        aria-hidden="true"
        className="hidden md:grid md:grid-cols-[23.5%_53.5%_23%] border-b-[1.5px] border-black bg-white py-3 items-center"
      >
        <div className="px-5 lg:px-7 text-[10.5px] font-extrabold tracking-[0.11em] uppercase text-black">
          01 / COURT &amp; JURISDICTION
        </div>
        <div className="px-5 lg:px-7 border-l-[1.5px] border-black text-[10.5px] font-extrabold tracking-[0.11em] uppercase text-black leading-none py-0.5">
          02 / CASE RECORD
        </div>
        <div className="px-5 lg:px-7 border-l-[1.5px] border-black text-[10.5px] font-extrabold tracking-[0.11em] uppercase text-black leading-none py-0.5">
          03 / METADATA &amp; ACTIONS
        </div>
      </div>

      <section aria-label="Case Records">
        {cases.map((record, idx) => {
          const globalIndex = (currentPage - 1) * pageSize + idx + 1
          return (
            <CaseResult
              key={record.id}
              record={record}
              index={globalIndex}
              onTagClick={onTagClick}
            />
          )
        })}
      </section>
    </div>
  )
}
