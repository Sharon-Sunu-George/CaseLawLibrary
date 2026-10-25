'use client'

import Link from 'next/link'
import { ArrowRight, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/case-query'
import type { CaseRecord } from '@/lib/case-types'
import { useLibrary } from './library-provider'

const VISIBLE_TAGS = 2

const actionBase =
  'inline-flex h-10 items-center gap-2 border-2 border-ink px-4 text-[12px] font-extrabold uppercase tracking-wider transition-colors'

// Dates and codes show their label below xl; at xl the table header supplies it.
const metaLabel = 'label-caps text-ink-subtle xl:sr-only'

export function CaseResult({ record, index }: { record: CaseRecord; index: number }) {
  const { openDialog } = useLibrary()
  const date = formatDate(record.decisionDate)
  const reference = [record.citation, record.caseNumber].filter(Boolean).join(' · ')
  const hiddenTags = Math.max(0, record.tags.length - VISIBLE_TAGS)

  return (
    <article
      aria-labelledby={`${record.id}-title`}
      className="flex flex-col gap-4 py-6 md:grid md:grid-cols-12 md:gap-x-[var(--dp-spacing-gutter)] md:gap-y-4 xl:gap-y-0"
    >
      {/* Column 1: Court & Jurisdiction (columns 1-3) */}
      <div className="min-w-0 md:col-span-3 md:col-start-1 md:row-span-2 md:row-start-1">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center bg-ink text-[12px] font-black tabular-nums text-ground"
          >
            {String(index).padStart(2, '0')}
          </span>
          {record.needsReview && (
            <span
              title="Needs review"
              className="inline-flex items-center gap-1.5 border border-accent bg-accent-subtle px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-accent"
            >
              <span className="size-1.5 bg-accent" aria-hidden="true" />
              Review
            </span>
          )}
        </div>
        <dl className="mt-2.5 text-[14px] leading-[1.4]">
          <dt className="sr-only">Court</dt>
          <dd className="break-words text-[15px] font-extrabold text-ink">{record.court}</dd>
          <dt className="sr-only">Jurisdiction</dt>
          <dd className="mt-0.5 break-words text-[13px] font-medium text-ink-subtle">{record.jurisdiction}</dd>
        </dl>
      </div>

      {/* Column 2: Case title, reference, summary & tags (columns 4-9) */}
      <div className="min-w-0 md:col-span-9 md:col-start-4 md:row-start-1 xl:col-span-6">
        <h2
          id={`${record.id}-title`}
          className="text-[20px] font-[800] leading-[1.25] tracking-[-0.02em] text-ink"
        >
          <Link
            href={`/cases/${record.id}`}
            className="hover:text-accent decoration-2 underline-offset-4 hover:underline transition-colors"
          >
            {record.title}
          </Link>
        </h2>

        {reference && (
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-bold tracking-tight text-ink">
            <span className="break-words font-mono text-[13px] font-semibold text-ink">{reference}</span>
          </p>
        )}

        <p className="mt-2.5 line-clamp-2 max-w-[68ch] text-[15px] font-normal leading-[1.6] text-ink-muted">
          {record.summary}
        </p>

        {record.tags.length > 0 && (
          <ul
            aria-label="Legal topics"
            className="mt-3 flex flex-wrap items-center gap-1.5"
          >
            {record.tags.slice(0, VISIBLE_TAGS).map((tag) => (
              <li
                key={tag}
                title={tag}
                className="max-w-full truncate border border-ink/20 bg-surface px-2.5 py-0.5 text-[12px] font-medium text-ink"
              >
                {tag}
              </li>
            ))}
            {hiddenTags > 0 && (
              <li className="shrink-0 px-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-subtle">
                +{hiddenTags} more
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Column 3: Code / Decided & Actions (columns 10-12) */}
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-6 gap-y-3 md:col-span-9 md:col-start-4 md:row-start-2 xl:col-span-3 xl:col-start-10 xl:row-start-1 xl:flex-col xl:items-start xl:justify-between xl:gap-y-4 xl:pt-0.5">
        <dl className="flex flex-wrap gap-x-8 gap-y-2 xl:flex-col xl:gap-y-1.5">
          <div className="min-w-0">
            <dt className={metaLabel}>Code</dt>
            <dd className="break-words text-[14px] font-extrabold leading-[1.3] text-ink">
              {record.code}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className={metaLabel}>Decided</dt>
            <dd
              className={`text-[13px] font-medium leading-[1.35] tabular-nums text-ink-subtle ${date ? '' : 'italic'}`}
            >
              {date ?? 'Date not recorded'}
            </dd>
          </div>
        </dl>

        <div className="flex w-full items-center gap-2 xl:w-auto">
          <Link
            href={`/cases/${record.id}`}
            aria-label={`View case: ${record.title}`}
            className={`${actionBase} bg-ink text-ground hover:bg-accent hover:border-accent hover:text-ground`}
          >
            View
            <ArrowRight className="size-3.5" strokeWidth={3} aria-hidden="true" />
          </Link>
          <button
            type="button"
            className={`${actionBase} bg-ground text-ink hover:bg-ink hover:text-ground`}
            aria-label={`Edit ${record.title}`}
            onClick={() => openDialog({ kind: 'form', caseId: record.id })}
          >
            <Pencil className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </article>
  )
}
