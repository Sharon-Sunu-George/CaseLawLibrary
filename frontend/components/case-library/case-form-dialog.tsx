'use client'

import { useState } from 'react'
import type { CaseRecord } from '@/lib/case-types'
import { useLibrary } from './library-provider'
import { Field, Modal, controlClass, primaryButtonClass, secondaryButtonClass } from './ui'

type Errors = Partial<Record<'title' | 'court' | 'jurisdiction' | 'code' | 'summary', string>>

type Props = { open: boolean; caseId?: string; onClose: () => void }

export function CaseFormDialog({ open, caseId, onClose }: Props) {
  const { cases } = useLibrary()
  const existing = caseId ? cases.find((item) => item.id === caseId) : undefined

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={existing ? 'EDIT CASE RECORD' : 'ADD CASE TO LIBRARY'}
      description="Changes apply to this browser session only. Nothing is written to an external database."
    >
      <CaseForm key={existing?.id ?? 'new'} existing={existing} onClose={onClose} />
    </Modal>
  )
}

function CaseForm({ existing, onClose }: { existing?: CaseRecord; onClose: () => void }) {
  const { saveCase, deleteCase } = useLibrary()
  const isNew = !existing

  const [title, setTitle] = useState(existing?.title ?? '')
  const [citation, setCitation] = useState(existing?.citation ?? existing?.caseNumber ?? '')
  const [court, setCourt] = useState(existing?.court ?? 'Karnataka High Court')
  const [jurisdiction, setJurisdiction] = useState(existing?.jurisdiction ?? 'Karnataka')
  const [code, setCode] = useState(existing?.code ?? 'Other')
  const [decisionDate, setDecisionDate] = useState(existing?.decisionDate ?? '2026-10-17')
  const [summary, setSummary] = useState(existing?.summary ?? '')
  const [topicsInput, setTopicsInput] = useState(existing?.tags?.join(', ') ?? '')
  const [needsReview, setNeedsReview] = useState(existing?.needsReview ?? false)
  const [errors, setErrors] = useState<Errors>({})

  const formatDisplayDate = (isoDate: string): string => {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const parts = isoDate.split('-')
    if (parts.length !== 3) return isoDate
    const year = parts[0]
    const monthIndex = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11 || isNaN(day)) return isoDate
    return `${String(day).padStart(2, '0')} ${MONTHS[monthIndex]} ${year}`
  }

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const next: Errors = {}
    if (!title.trim()) next.title = 'Enter the case title.'
    if (!citation.trim()) next.court = 'Enter citation or case number.'
    if (!court.trim()) next.court = 'Enter the court.'
    if (!jurisdiction.trim()) next.jurisdiction = 'Enter the jurisdiction.'
    if (!summary.trim()) next.summary = 'Enter a headnote summary.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    const parsedTopics = topicsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const record: CaseRecord = {
      id: existing?.id ?? `case-${Date.now()}`,
      title: title.trim(),
      citation: citation.trim(),
      caseNumber: citation.trim(),
      court: court.trim(),
      jurisdiction: jurisdiction.trim(),
      code: code.trim() || 'Other',
      decisionDate,
      decidedDisplay: formatDisplayDate(decisionDate),
      bench: existing?.bench,
      summary: summary.trim(),
      fullNotes: summary.trim(),
      tags: parsedTopics.length > 0 ? parsedTopics : ['general precedent'],
      needsReview,
      source: existing?.source ?? 'Verdictum',
    }

    saveCase(record, isNew)
    onClose()
  }

  const handleDelete = () => {
    if (!existing) return
    if (window.confirm(`Are you sure you want to delete "${existing.title}"?`)) {
      deleteCase(existing.id, existing.title)
      onClose()
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Field id="case-title" label="CASE TITLE" error={errors.title} required>
            <input
              id="case-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Sri Muniraju v. Sri S. Devaraj"
              className={controlClass}
            />
          </Field>
        </div>

        <div>
          <Field id="case-citation" label="CITATION / DOCKET NO." required>
            <input
              id="case-citation"
              type="text"
              required
              value={citation}
              onChange={(e) => setCitation(e.target.value)}
              placeholder="e.g., 2026 INSC 1137"
              className={controlClass}
            />
          </Field>
        </div>

        <div>
          <Field id="case-date" label="DECISION DATE" required>
            <input
              id="case-date"
              type="date"
              required
              value={decisionDate}
              onChange={(e) => setDecisionDate(e.target.value)}
              className={controlClass}
            />
          </Field>
        </div>

        <div>
          <Field id="case-court" label="COURT" error={errors.court} required>
            <input
              id="case-court"
              type="text"
              required
              value={court}
              onChange={(e) => setCourt(e.target.value)}
              className={controlClass}
            />
          </Field>
        </div>

        <div>
          <Field id="case-jurisdiction" label="JURISDICTION" error={errors.jurisdiction} required>
            <input
              id="case-jurisdiction"
              type="text"
              required
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              className={controlClass}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field id="case-code" label="PRIMARY LEGAL CODE">
            <input
              id="case-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., Code of Civil Procedure, Bharatiya Nagarik Suraksha Sanhita, Other"
              className={controlClass}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field id="case-summary" label="HEADNOTE SUMMARY" error={errors.summary} required>
            <textarea
              id="case-summary"
              rows={3}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 border border-black text-xs text-black focus:outline-none"
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field id="case-topics" label="LEGAL TOPICS (COMMA SEPARATED)">
            <input
              id="case-topics"
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="Section 138 NI Act, rebuttal of presumption, financial capacity"
              className={controlClass}
            />
          </Field>
        </div>

        <div className="sm:col-span-2 pt-1">
          <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={needsReview}
              onChange={(e) => setNeedsReview(e.target.checked)}
              className="w-4 h-4 accent-[#D91C1F]"
            />
            <span className="w-2 h-2 bg-[#D91C1F] inline-block" />
            <span className="text-xs font-bold text-black">
              Flag record as &ldquo;Needs review&rdquo;
            </span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-neutral-200 flex items-center justify-between gap-3">
        {!isNew && existing ? (
          <button
            type="button"
            onClick={handleDelete}
            className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-[#D91C1F] hover:underline cursor-pointer"
          >
            DELETE RECORD
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            CANCEL
          </button>
          <button type="submit" className={primaryButtonClass}>
            {isNew ? 'CREATE RECORD' : 'SAVE CHANGES'}
          </button>
        </div>
      </div>
    </form>
  )
}
