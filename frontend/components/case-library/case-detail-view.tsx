'use client'

import Link from 'next/link'
import { ArrowLeft, Copy, Pencil } from 'lucide-react'
import { formatDate } from '@/lib/case-query'
import { useLibrary } from './library-provider'
import { primaryButtonClass, secondaryButtonClass } from './ui'

function Section({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section
      aria-label={label}
      className="frame grid swiss-cols gap-y-4 border-t-2 border-ink py-8 md:py-10"
    >
      <h2 className="label-caps text-ink md:col-span-3">{label}</h2>
      <div className="min-w-0 md:col-span-9">{children}</div>
    </section>
  )
}

export function CaseDetailView({ id }: { id: string }) {
  const { cases, lastQuery, openDialog, notify } = useLibrary()
  const record = cases.find((item) => item.id === id)
  const backHref = lastQuery ? `/?${lastQuery}` : '/'

  const backBar = (
    <div className="border-b-2 border-ink">
      <div className="frame py-2">
        <Link
          href={backHref}
          className="inline-flex h-11 items-center gap-2 pr-2 text-[14px] font-bold text-ink underline-offset-4 hover:underline"
        >
          <ArrowLeft className="size-4" strokeWidth={2.5} aria-hidden="true" />
          Back to results
        </Link>
      </div>
    </div>
  )

  if (!record) {
    return (
      <>
        {backBar}
        <div className="frame grid swiss-cols py-12 md:py-16">
          <div className="md:col-span-9 md:col-start-4">
            <h1 className="text-[clamp(2.25rem,5vw,4rem)] font-[750] leading-[1] tracking-[-0.035em] text-ink">
              Case not found
            </h1>
            <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.5] text-ink-muted">
              This record isn&apos;t in the library. Cases added during a session
              are not stored anywhere, so they are lost when the page is reloaded.
            </p>
            <Link href="/" className={`${secondaryButtonClass} mt-6`}>
              Return to the library
            </Link>
          </div>
        </div>
      </>
    )
  }

  const reference = [record.citation, record.caseNumber].filter(Boolean).join(' · ')

  const copyReference = async () => {
    const text = [record.title, reference, record.court].filter(Boolean).join(', ')
    try {
      await navigator.clipboard.writeText(text)
      notify('Reference copied to the clipboard.')
    } catch {
      notify('The reference could not be copied. Select the text and copy it manually.', 'info')
    }
  }

  const date = formatDate(record.decisionDate)
  const details: { label: string; value: string }[] = [
    { label: 'Court', value: record.court },
    { label: 'Jurisdiction', value: record.jurisdiction },
    { label: 'Code', value: record.code },
    { label: 'Decided', value: date ?? 'Date not recorded' },
    { label: 'Listed by', value: record.source ?? 'Not recorded' },
    { label: 'Source document', value: 'No PDF attached to this sample record' },
  ]

  return (
    <article>
      {backBar}

      <header className="frame grid swiss-cols gap-y-6 pb-10 pt-8 md:pb-14 md:pt-10">
        <div className="md:col-span-3">
          <p className="label-caps text-ink">
            <span aria-hidden="true">— </span>Case Record
          </p>
          {record.needsReview ? (
            <p className="label-caps mt-3 inline-flex items-center gap-2 border-2 border-accent bg-accent-subtle px-3 py-1.5 font-black text-accent">
              <span className="size-2 bg-accent" aria-hidden="true" />
              Needs review
            </p>
          ) : (
            <p className="label-caps mt-3 inline-flex items-center gap-2 border-2 border-ink bg-surface px-3 py-1.5 text-ink">
              Verified record
            </p>
          )}
        </div>

        <div className="min-w-0 md:col-span-9">
          <div className="border border-ink/20 bg-surface px-3 py-1.5 inline-block">
            <p className="label-caps text-ink-subtle">
              Illustrative sample record · Not a verified judgment
            </p>
          </div>
          <h1 className="mt-4 max-w-[28ch] text-balance text-[clamp(2rem,5vw,4.25rem)] font-[850] leading-[0.98] tracking-[-0.035em] text-ink">
            {record.title}
          </h1>

          <dl className="mt-8 grid border-t-2 border-ink sm:grid-cols-2 sm:gap-x-[var(--dp-spacing-gutter)]">
            <div className="min-w-0 py-5">
              <dt className="label-caps text-ink-subtle">Citation</dt>
              <dd className="mt-2 break-words font-mono text-[22px] font-bold leading-[1.2] tracking-tight text-ink">
                {record.citation ?? 'Not available'}
              </dd>
            </div>
            <div className="min-w-0 border-t-2 border-rule-soft py-5 sm:border-t-0">
              <dt className="label-caps text-ink-subtle">Case number</dt>
              <dd className="mt-2 break-words font-mono text-[22px] font-bold leading-[1.2] tracking-tight text-ink">
                {record.caseNumber ?? 'Not available'}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={copyReference} className={primaryButtonClass}>
              <Copy className="size-4" aria-hidden="true" />
              Copy reference
            </button>
            <button
              type="button"
              onClick={() => openDialog({ kind: 'form', caseId: record.id })}
              className={secondaryButtonClass}
            >
              <Pencil className="size-4" aria-hidden="true" />
              Edit record
            </button>
          </div>
        </div>
      </header>

      <Section label="Record details">
        <dl className="grid gap-x-[var(--dp-spacing-gutter)] sm:grid-cols-2 xl:grid-cols-3">
          {details.map((item) => (
            <div key={item.label} className="min-w-0 border-t-2 border-rule-soft py-5">
              <dt className="label-caps text-ink-subtle">{item.label}</dt>
              <dd className="mt-2 break-words text-[17px] font-bold leading-[1.3] text-ink">
                {item.value}
              </dd>
            </div>
          ))}
          <div className="min-w-0 border-t-2 border-rule-soft py-5">
            <dt className="label-caps text-ink-subtle">Review status</dt>
            <dd className="mt-2 text-[17px] font-bold leading-[1.3]">
              {record.needsReview ? (
                <span className="inline-flex items-center gap-2 font-black text-accent">
                  <span className="size-2.5 bg-accent" aria-hidden="true" />
                  Flagged for review
                </span>
              ) : (
                <span className="text-ink">No review flagged</span>
              )}
            </dd>
          </div>
        </dl>
      </Section>

      <Section label="Summary">
        <p className="max-w-[62ch] text-[18px] leading-[1.6] text-ink">{record.summary}</p>
      </Section>

      <Section label="Legal topics">
        {record.tags.length > 0 ? (
          <ul className="flex max-w-[72ch] flex-wrap gap-2">
            {record.tags.map((tag) => (
              <li
                key={tag}
                className="max-w-full bg-surface px-3 py-1.5 text-[14px] leading-snug text-ink"
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[15px] text-ink-muted">No topics have been added.</p>
        )}
      </Section>

      <div className="border-t-2 border-ink" />
    </article>
  )
}
