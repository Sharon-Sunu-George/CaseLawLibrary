'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, ExternalLink, FileText } from 'lucide-react'
import { formatDate } from '@/lib/case-query'
import { formatFileSize, getDocument, type StoredDocument } from '@/lib/document-storage'
import { useLibrary } from './library-provider'

export function CaseDetailView({ id }: { id: string }) {
  const { cases, lastQuery, openDialog, saveCase, notify, isAuthenticated, isHydrated } = useLibrary()
  const record = cases.find((item) => item.id === id)
  const backHref = lastQuery ? `/?${lastQuery}` : '/'

  const [docRecord, setDocRecord] = useState<StoredDocument | null>(null)
  const [docUrl, setDocUrl] = useState<string | null>(null)
  const [isLoadingDoc, setIsLoadingDoc] = useState(false)

  useEffect(() => {
    let active = true
    let objectUrl: string | null = null

    if (record?.pdfMetadata) {
      setIsLoadingDoc(true)
      const lookupKey = record.pdfMetadata.documentId || record.id
      getDocument(lookupKey, record.id)
        .then((doc) => {
          if (!active) return
          setDocRecord(doc)
          if (doc?.blob) {
            objectUrl = URL.createObjectURL(doc.blob)
            setDocUrl(objectUrl)
          } else {
            setDocUrl(null)
          }
        })
        .catch((err) => {
          console.error('Failed to load PDF document from storage:', err)
          if (active) {
            setDocRecord(null)
            setDocUrl(null)
          }
        })
        .finally(() => {
          if (active) setIsLoadingDoc(false)
        })
    } else {
      setDocRecord(null)
      setDocUrl(null)
      setIsLoadingDoc(false)
    }

    return () => {
      active = false
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [record?.id, record?.pdfMetadata?.documentId, record?.pdfMetadata?.uploadedAt])

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

  if (!record && !isHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col bg-white">
        {backBar}
        <div className="px-6 py-16 text-center border-b-[1.5px] border-black bg-white flex-1 flex flex-col items-center justify-center">
          <div className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-neutral-400 mb-2">
            00 / LOADING DOSSIER
          </div>
          <div className="text-xs text-neutral-500">
            Reading research index from storage…
          </div>
        </div>
      </div>
    )
  }

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

  const handleToggleReview = async () => {
    const updated = {
      ...record,
      needsReview: !record.needsReview,
    }
    await saveCase(updated, false)
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

      {/* JUDGMENT DOCUMENT */}
      <section
        aria-label="Judgment Document"
        className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black"
      >
        <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-4 md:py-6 bg-white">
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
            <div>04 /</div>
            <div>JUDGMENT</div>
            <div>DOCUMENT</div>
          </div>
        </div>

        <div className="px-5 sm:px-8 py-6">
          {isLoadingDoc ? (
            <div className="border border-black p-10 text-center bg-neutral-50 flex flex-col items-center justify-center min-h-[200px]">
              <div className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-neutral-400 mb-2">
                LOADING ATTACHED PDF
              </div>
              <p className="text-xs text-neutral-600">
                Retrieving judgment document from local storage…
              </p>
            </div>
          ) : docUrl && record.pdfMetadata ? (
            <div className="space-y-3">
              {/* Document Header Bar */}
              <div className="border border-black bg-neutral-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-[#D91C1F] shrink-0" />
                  <span className="text-xs font-bold text-black truncate max-w-[280px] sm:max-w-md">
                    {record.pdfMetadata.fileName}
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider shrink-0">
                    ({formatFileSize(record.pdfMetadata.fileSize)})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={docUrl}
                    download={record.pdfMetadata.fileName}
                    className="inline-flex items-center gap-1.5 border border-black bg-white px-3 py-1.5 text-[10px] font-extrabold tracking-[0.1em] uppercase text-black hover:bg-neutral-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>DOWNLOAD</span>
                  </a>
                  <a
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-black text-white px-3 py-1.5 text-[10px] font-extrabold tracking-[0.1em] uppercase hover:bg-[#D91C1F] transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>OPEN IN NEW TAB</span>
                  </a>
                </div>
              </div>

              {/* PDF Preview Frame */}
              <div className="border border-black bg-neutral-100 overflow-hidden">
                <iframe
                  src={`${docUrl}#view=FitH`}
                  title={`Judgment PDF - ${record.title}`}
                  className="w-full h-[600px] border-none block"
                />
              </div>
            </div>
          ) : record.pdfMetadata && !docRecord ? (
            <div className="border border-black p-8 text-center bg-white flex flex-col items-center justify-center">
              <div className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#D91C1F] mb-1.5">
                DOCUMENT DATA UNAVAILABLE
              </div>
              <p className="text-xs text-neutral-600 mb-4 max-w-md">
                The metadata references &ldquo;{record.pdfMetadata.fileName}&rdquo;, but the file binary was not found in browser storage.
              </p>
              <button
                type="button"
                onClick={handleEdit}
                className="bg-black text-white hover:bg-[#D91C1F] text-[11px] font-extrabold tracking-[0.12em] uppercase px-4 h-9 inline-flex items-center transition-colors cursor-pointer"
              >
                ATTACH REPLACEMENT PDF
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-neutral-300 p-8 text-center bg-white flex flex-col items-center justify-center">
              <FileText className="w-7 h-7 text-neutral-300 mb-2" />
              <div className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-neutral-500 mb-1">
                NO JUDGMENT DOCUMENT ATTACHED
              </div>
              <p className="text-xs text-neutral-400 mb-4 max-w-sm">
                Attach an official PDF copy of the judgment to view it inline alongside this dossier.
              </p>
              <button
                type="button"
                onClick={handleEdit}
                className="border border-black hover:border-[#D91C1F] hover:text-[#D91C1F] text-black text-[11px] font-extrabold tracking-[0.12em] uppercase px-4 h-9 inline-flex items-center transition-colors cursor-pointer"
              >
                + ATTACH PDF DOCUMENT
              </button>
            </div>
          )}
        </div>
      </section>

      {/* INDEXED LEGAL TOPICS */}
      <section
        aria-label="Legal Topics"
        className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black"
      >
        <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-4 md:py-6 bg-white">
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
            <div>05 /</div>
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
