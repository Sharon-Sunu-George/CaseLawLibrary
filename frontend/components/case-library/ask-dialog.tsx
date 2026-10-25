'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { filtersToQueryString, DEFAULT_FILTERS } from '@/lib/case-query'
import { Field, Modal, controlClass, primaryButtonClass } from './ui'

export function AskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [question, setQuestion] = useState('')
  const [error, setError] = useState('')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) {
      setError('Enter a question or keywords to search for.')
      return
    }
    setError('')
    const qs = filtersToQueryString({ ...DEFAULT_FILTERS, query: trimmed })
    setQuestion('')
    onClose()
    router.push(`/?${qs}`)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Ask the Library"
      description="Natural-language answers need a research service that is not part of this prototype. Your question is run as a keyword search across the sample records instead."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        <Field id="ask-question" label="Your question" error={error} required>
          <input
            id="ask-question"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'ask-question-error' : undefined}
            placeholder="For example: quashing of FIR"
            className={controlClass}
            autoComplete="off"
          />
        </Field>
        <div className="flex justify-end">
          <button type="submit" className={primaryButtonClass}>
            <Search className="size-4" aria-hidden="true" />
            Search sample records
          </button>
        </div>
      </form>
    </Modal>
  )
}
