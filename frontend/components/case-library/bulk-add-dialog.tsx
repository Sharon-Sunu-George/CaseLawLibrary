'use client'

import { useState } from 'react'
import type { CaseRecord } from '@/lib/case-types'
import { useLibrary } from './library-provider'
import { Field, Modal, controlClass, primaryButtonClass, secondaryButtonClass } from './ui'

const MAX_TITLES = 25

export function BulkAddDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCases, notify } = useLibrary()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const titles = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    if (titles.length === 0) {
      setError('Enter at least one case title, one per line.')
      return
    }
    if (titles.length > MAX_TITLES) {
      setError(`Add up to ${MAX_TITLES} titles at a time. You entered ${titles.length}.`)
      return
    }

    const stamp = Date.now()
    const drafts: CaseRecord[] = titles.map((title, index) => ({
      id: `draft-${stamp}-${index}`,
      title,
      court: 'Unspecified',
      jurisdiction: 'Unspecified',
      code: 'Other',
      summary: 'Draft record created by bulk add. Details have not been entered yet.',
      tags: [],
      needsReview: true,
    }))

    addCases(drafts)
    setValue('')
    setError('')
    onClose()
    notify(
      `${titles.length} draft ${titles.length === 1 ? 'case' : 'cases'} added and marked for review. They exist only in this browser session.`,
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk Add"
      description="Enter one case title per line. Each becomes a draft record marked for review, which you can complete with Edit."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field
          id="bulk-titles"
          label="Case titles"
          hint={`One title per line, up to ${MAX_TITLES}.`}
          error={error}
          required
        >
          <textarea
            id="bulk-titles"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            rows={7}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'bulk-titles-error' : 'bulk-titles-hint'}
            placeholder={'Party A v. Party B\nParty C v. State of …'}
            className={`${controlClass} h-auto min-h-36 resize-y py-2.5 leading-[1.65]`}
          />
        </Field>
        <div className="flex flex-col-reverse gap-3 xs:flex-row xs:justify-end">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Cancel
          </button>
          <button type="submit" className={primaryButtonClass}>
            Add drafts
          </button>
        </div>
      </form>
    </Modal>
  )
}
