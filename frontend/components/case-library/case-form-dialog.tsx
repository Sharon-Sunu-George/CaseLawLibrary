'use client'

import { useState } from 'react'
import type { CaseRecord } from '@/lib/case-types'
import { uniqueValues } from '@/lib/case-query'
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
      title={existing ? 'Edit case' : 'Add a case'}
      description="Changes apply to this browser session only. Nothing is written to a database."
    >
      {/* Remount per record so the uncontrolled fields reset between uses */}
      <CaseForm key={existing?.id ?? 'new'} existing={existing} onClose={onClose} />
    </Modal>
  )
}

function CaseForm({ existing, onClose }: { existing?: CaseRecord; onClose: () => void }) {
  const { cases, saveCase, notify } = useLibrary()
  const [errors, setErrors] = useState<Errors>({})
  const courts = uniqueValues(cases, 'court')
  const codes = uniqueValues(cases, 'code')

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const read = (name: string) => String(data.get(name) ?? '').trim()

    const next: Errors = {}
    if (!read('title')) next.title = 'Enter the case title.'
    if (!read('court')) next.court = 'Enter the court.'
    if (!read('jurisdiction')) next.jurisdiction = 'Enter the jurisdiction.'
    if (!read('code')) next.code = 'Enter the code or statute, or “Other”.'
    if (!read('summary')) next.summary = 'Enter a short summary.'
    setErrors(next)
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0]
      event.currentTarget.querySelector<HTMLElement>(`#case-${first}`)?.focus()
      return
    }

    const record: CaseRecord = {
      id: existing?.id ?? `local-${Date.now()}`,
      title: read('title'),
      caseNumber: read('caseNumber') || undefined,
      citation: read('citation') || undefined,
      court: read('court'),
      jurisdiction: read('jurisdiction'),
      code: read('code'),
      decisionDate: read('decisionDate') || undefined,
      summary: read('summary'),
      tags: read('tags')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      needsReview: data.get('needsReview') === 'on',
      source: existing?.source,
    }

    saveCase(record)
    onClose()
    notify(
      existing
        ? 'Changes applied to this session. They are not saved to a database.'
        : 'Case added to this session. It is not saved to a database and will disappear on reload.',
    )
  }

  const describe = (name: keyof Errors) =>
    errors[name] ? `case-${name}-error` : undefined

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field id="case-title" label="Title" error={errors.title} required>
        <input
          id="case-title"
          name="title"
          defaultValue={existing?.title}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={describe('title')}
          className={controlClass}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="case-caseNumber" label="Case number">
          <input id="case-caseNumber" name="caseNumber" defaultValue={existing?.caseNumber} className={controlClass} />
        </Field>
        <Field id="case-citation" label="Citation" hint="Leave blank if none is available.">
          <input id="case-citation" name="citation" defaultValue={existing?.citation} aria-describedby="case-citation-hint" className={controlClass} />
        </Field>
        <Field id="case-court" label="Court" error={errors.court} required>
          <input
            id="case-court"
            name="court"
            list="court-options"
            defaultValue={existing?.court}
            aria-invalid={Boolean(errors.court)}
            aria-describedby={describe('court')}
            className={controlClass}
          />
          <datalist id="court-options">
            {courts.map((court) => (
              <option key={court} value={court} />
            ))}
          </datalist>
        </Field>
        <Field id="case-jurisdiction" label="Jurisdiction" error={errors.jurisdiction} required>
          <input
            id="case-jurisdiction"
            name="jurisdiction"
            defaultValue={existing?.jurisdiction}
            aria-invalid={Boolean(errors.jurisdiction)}
            aria-describedby={describe('jurisdiction')}
            className={controlClass}
          />
        </Field>
        <Field id="case-code" label="Code" error={errors.code} required>
          <input
            id="case-code"
            name="code"
            list="code-options"
            defaultValue={existing?.code}
            aria-invalid={Boolean(errors.code)}
            aria-describedby={describe('code')}
            className={controlClass}
          />
          <datalist id="code-options">
            {codes.map((code) => (
              <option key={code} value={code} />
            ))}
          </datalist>
        </Field>
        <Field id="case-decisionDate" label="Decision date">
          <input id="case-decisionDate" name="decisionDate" type="date" defaultValue={existing?.decisionDate} className={controlClass} />
        </Field>
      </div>

      <Field id="case-summary" label="Summary" error={errors.summary} required>
        <textarea
          id="case-summary"
          name="summary"
          rows={4}
          defaultValue={existing?.summary}
          aria-invalid={Boolean(errors.summary)}
          aria-describedby={describe('summary')}
          className={`${controlClass} h-auto resize-y py-2.5 leading-[1.65]`}
        />
      </Field>

      <Field id="case-tags" label="Legal topics" hint="Separate topics with commas.">
        <input
          id="case-tags"
          name="tags"
          defaultValue={existing?.tags.join(', ')}
          aria-describedby="case-tags-hint"
          className={controlClass}
        />
      </Field>

      <label className="flex min-h-11 items-center gap-3 text-[14px] font-bold text-ink">
        <input
          type="checkbox"
          name="needsReview"
          defaultChecked={existing?.needsReview ?? true}
          className="size-5 accent-accent"
        />
        Needs review
      </label>

      <div className="flex flex-col-reverse gap-3 border-t-2 border-ink pt-5 xs:flex-row xs:justify-end">
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          Cancel
        </button>
        <button type="submit" className={primaryButtonClass}>
          {existing ? 'Apply changes' : 'Add case'}
        </button>
      </div>
    </form>
  )
}
