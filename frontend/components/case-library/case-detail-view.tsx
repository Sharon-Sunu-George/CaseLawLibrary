'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/case-query'
import { useLibrary } from './library-provider'

export function CaseDetailView({ id }: { id: string }) {
  const { cases, lastQuery, openDialog, saveCase, notify, isAuthenticated } = useLibrary()
  const record = cases.find((item) => item.id === id)
  const backHref = lastQuery ? `/?${lastQuery}` : '/'

  const backBar = (
    <div className="border-b-[1.5px] border-black bg-white px-5 sm:px-8 py-3">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.12em] text-black hover:text-[#D91C1F] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO RESEARCH INDEX</span>
      </Link>
    </div>
  )

  if (!record) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        {backBar}
        <div className="px-6 py-16 text-center border-b-[1.5px] border-black bg-white flex-1 flex flex-col items-center justify-center">
          <div className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#D91C1F] mb-2">
            00 / DOSSIER NOT FOUND
          </div>
          <h1 className="text-2xl font-black text-black mb-2">Case Dossier Not Found</h1>
          <p className="text-xs text-neutral-600 mb-6 max-w-md">
            This record does not exist in the active session index. Unsaved additions expire on session reload.
          </p>
          <Link
            href="/"
            className="bg-black hover:bg-[#D91C1F] text-white text-[11px] font-extrabold tracking-[0.14em] uppercase px-6 h-10 inline-flex items-center transition-colors"
          >
            RETURN TO LIBRARY
          </Link>
        </div>
      </div>
    )
  }

  const handleToggleReview = () => {
    const updated = {
      ...record,
      needsReview: !record.needsReview,
    }
    saveCase(updated, false)
    notify(
      updated.needsReview
        ? `Flagged "${record.title}" for review.`
        : `Marked "${record.title}" as verified.`,
    )
  }

  const handleEdit = () => {
    if (!isAuthenticated) {
      notify('Please log in to edit case records.', 'info')
      return
    }
    openDialog({ kind: 'form', caseId: record.id })
  }

  const displayDate = record.decidedDisplay || formatDate(record.decisionDate) || 'Not recorded'

  return (
    <article className="bg-white">
      {backBar}

      {/* CASE DOSSIER HEADER */}
      <section
        aria-label="Case Header"
        className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black"
      >
        {/* Left Section Rail */}
        <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-4 md:py-8 bg-white">
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
            <div>01 /</div>
            <div>DOSSIER</div>
          </div>
        </div>

        {/* Dossier Content */}
        <div className="px-5 sm:px-8 py-6 sm:py-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#D91C1F]">
              {record.court} — {record.jurisdiction}
            </span>
            {record.needsReview ? (
              <span className="inline-flex items-center gap-1.5 border border-[#D91C1F] px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-[0.11em] uppercase text-[#D91C1F] bg-white">
                <span className="w-1.5 h-1.5 bg-[#D91C1F] inline-block" />
                NEEDS REVIEW
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 border border-black px-2.5 py-0.5 text-[9.5px] font-extrabold tracking-[0.11em] uppercase text-black bg-white">
                VERIFIED PRECEDENT
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black tracking-[-0.03em] leading-tight">
            {record.title}
          </h1>

          <div className="text-sm font-semibold text-neutral-500 mt-2 mb-6">
            {record.citation || record.caseNumber}
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleToggleReview}
              className="border border-black px-4 h-10 text-[11px] font-extrabold tracking-[0.12em] uppercase text-black hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              {record.needsReview ? 'MARK AS VERIFIED' : 'FLAG FOR REVIEW'}
            </button>
            <button
              type="button"
              onClick={handleEdit}
              className="bg-[#D91C1F] hover:bg-[#b51518] text-white px-5 h-10 text-[11px] font-extrabold tracking-[0.12em] uppercase transition-colors cursor-pointer"
            >
              ✎ EDIT RECORD
            </button>
          </div>
        </div>
      </section>

      {/* METADATA GRID */}
      <section
        aria-label="Metadata Grid"
        className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black"
      >
        <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-4 md:py-6 bg-white">
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
            <div>02 /</div>
            <div>RECORD</div>
            <div>DETAILS</div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-400">
                PRIMARY CODE
              </div>
              <div className="text-sm font-extrabold text-black mt-1">
                {record.code}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-400">
                DECISION DATE
              </div>
              <div className="text-sm font-extrabold text-black mt-1">
                {displayDate}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-400">
                BENCH / CORAM
              </div>
              <div className="text-sm font-bold text-neutral-800 mt-1">
                {record.bench || 'Division / Single Bench'}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.12em] uppercase text-neutral-400">
                LISTED BY
              </div>
              <div className="text-sm font-medium text-neutral-800 mt-1">
                {record.source || 'Official Law Reports'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HEADNOTE & RATIO */}
      <section
        aria-label="Headnote"
        className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black"
      >
        <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-4 md:py-6 bg-white">
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
            <div>03 /</div>
            <div>HEADNOTE</div>
            <div>&amp; RATIO</div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-8 max-w-4xl">
          <p className="text-base sm:text-[17px] text-neutral-800 leading-relaxed font-normal">
            {record.fullNotes || record.summary}
          </p>
        </div>
      </section>

      {/* INDEXED LEGAL TOPICS */}
      <section
        aria-label="Legal Topics"
        className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black"
      >
        <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-4 md:py-6 bg-white">
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
            <div>04 /</div>
            <div>INDEXED</div>
            <div>TOPICS</div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6 sm:py-8">
          {record.tags && record.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {record.tags.map((topic, i) => (
                <span
                  key={i}
                  className="border border-black px-3 py-1.5 text-xs font-semibold text-black bg-neutral-50 tracking-wide"
                >
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-500">No legal topics indexed for this record.</p>
          )}
        </div>
      </section>
    </article>
  )
}
