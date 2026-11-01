'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import type { CaseRecord } from '@/lib/case-types'
import { useLibrary } from './library-provider'

type Props = {
  record: CaseRecord
  index: number
  onTagClick?: (tag: string) => void
}

export function CaseResult({ record, index, onTagClick }: Props) {
  const { openDialog, isAuthenticated, notify } = useLibrary()
  const [expanded, setExpanded] = useState(false)

  const formattedNumber = String(index).padStart(2, '0')
  const visibleTags = expanded ? record.tags : record.tags.slice(0, 3)
  const hiddenCount = Math.max(0, record.tags.length - 3)

  const handleEdit = () => {
    if (!isAuthenticated) {
      notify('Please log in to edit case records.', 'info')
      return
    }
    openDialog({ kind: 'form', caseId: record.id })
  }

  return (
    <article className="grid grid-cols-1 md:grid-cols-[23.5%_53.5%_23%] border-b border-neutral-300 last:border-b-[1.5px] last:border-black py-5 md:py-6 bg-white hover:bg-neutral-50/70 transition-colors">
      {/* COLUMN 01: COURT & JURISDICTION */}
      <div className="px-5 lg:px-7 pb-4 md:pb-0 flex flex-col justify-start">
        <div className="flex items-center gap-3 flex-wrap mb-1.5">
          <span className="text-[13px] font-extrabold text-[#D91C1F] tracking-tight">
            {formattedNumber}
          </span>
          {record.needsReview && (
            <span className="inline-flex items-center gap-1.5 border border-[#D91C1F] px-2 py-0.5 text-[9.5px] font-extrabold tracking-[0.11em] uppercase text-[#D91C1F] bg-white">
              <span className="w-1.5 h-1.5 bg-[#D91C1F] inline-block" aria-hidden="true" />
              REVIEW
            </span>
          )}
        </div>
        <div className="text-[13.5px] font-extrabold text-black leading-snug">
          {record.court}
        </div>
        <div className="text-[12px] text-neutral-500 mt-0.5">
          {record.jurisdiction}
        </div>
      </div>

      {/* COLUMN 02: CASE RECORD */}
      <div className="px-5 lg:px-7 py-4 md:py-0 border-t md:border-t-0 md:border-l border-neutral-300 flex flex-col justify-between">
        <div>
          <h3 className="text-[17px] lg:text-[18.5px] font-extrabold text-black tracking-[-0.02em] leading-[1.25]">
            <Link
              href={`/cases/${record.id}`}
              className="text-left hover:text-[#D91C1F] transition-colors cursor-pointer focus:outline-none"
            >
              {record.title}
            </Link>
          </h3>
          <div className="text-[12.5px] text-neutral-500 mt-1 mb-2.5 font-normal">
            {record.citation || record.caseNumber}
          </div>
          <p className="text-[13.5px] text-neutral-700 leading-[1.55] mb-3.5">
            {record.summary}
          </p>
        </div>

        {/* Topics / Legal Tags */}
        {record.tags && record.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-neutral-700 pt-0.5">
            {visibleTags.map((topic, topicIdx) => (
              <React.Fragment key={`${record.id}-topic-${topicIdx}`}>
                {onTagClick ? (
                  <button
                    type="button"
                    onClick={() => onTagClick(topic)}
                    className="hover:text-[#D91C1F] hover:underline transition-colors cursor-pointer text-left"
                  >
                    {topic}
                  </button>
                ) : (
                  <span className="hover:text-[#D91C1F] transition-colors">{topic}</span>
                )}
                {topicIdx < visibleTags.length - 1 && (
                  <span className="text-[#D91C1F] font-semibold select-none" aria-hidden="true">
                    /
                  </span>
                )}
              </React.Fragment>
            ))}
            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((p) => !p)}
                className="font-extrabold text-black hover:text-[#D91C1F] ml-1 cursor-pointer transition-colors"
              >
                {expanded ? 'Show less' : `+ ${hiddenCount} more`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* COLUMN 03: METADATA & ACTIONS */}
      <div className="px-5 lg:px-7 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-neutral-300 flex flex-col justify-between">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
          <div>
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-400">
              CODE
            </div>
            <div className="text-[12.5px] font-extrabold text-black leading-snug mt-0.5">
              {record.code}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-400">
              DECIDED
            </div>
            <div className="text-[12.5px] text-neutral-700 mt-0.5">
              {record.decidedDisplay || record.decisionDate || 'Not recorded'}
            </div>
          </div>
        </div>

        {/* Row Actions: VIEW ↗ | ✎ EDIT */}
        <div className="flex items-center gap-4 pt-4 mt-3">
          <Link
            href={`/cases/${record.id}`}
            className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#D91C1F] hover:underline inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>VIEW</span>
            <span aria-hidden="true" className="text-[12px] leading-none">
              ↗
            </span>
          </Link>
          <span className="w-[1.5px] h-4 bg-black" aria-hidden="true" />
          <button
            type="button"
            onClick={handleEdit}
            className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-black hover:text-[#D91C1F] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" />
            </svg>
            <span>EDIT</span>
          </button>
        </div>
      </div>
    </article>
  )
}
