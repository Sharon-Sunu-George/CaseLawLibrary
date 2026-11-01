'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { filtersToQueryString, DEFAULT_FILTERS } from '@/lib/case-query'
import { useLibrary } from './library-provider'
import { Modal } from './ui'

const SAMPLE_QUERIES = [
  'Section 138 NI Act',
  'Section 25 Arms Act',
  'cloud on title',
  'freedom of speech',
]

export function AskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const { cases } = useLibrary()
  const [question, setQuestion] = useState('')
  const [submittedQuestion, setSubmittedQuestion] = useState('')

  const handleAsk = (queryText: string) => {
    const trimmed = queryText.trim()
    if (!trimmed) return
    setSubmittedQuestion(trimmed)
  }

  const handleFullSearch = (queryText: string) => {
    const qs = filtersToQueryString({ ...DEFAULT_FILTERS, query: queryText })
    setQuestion('')
    setSubmittedQuestion('')
    onClose()
    router.push(`/?${qs}`)
  }

  const matchingCases = submittedQuestion
    ? cases.filter((c) =>
        [c.title, c.citation, c.caseNumber, c.court, c.code, c.summary, ...(c.tags || [])]
          .join(' ')
          .toLowerCase()
          .includes(submittedQuestion.toLowerCase()),
      ).slice(0, 3)
    : []

  return (
    <Modal
      open={open}
      onClose={() => {
        setQuestion('')
        setSubmittedQuestion('')
        onClose()
      }}
      size="lg"
      title="ASK LIBRARY — PRECEDENT RESEARCH ASSISTANT"
    >
      <div className="space-y-5">
        <p className="text-xs text-neutral-600 leading-relaxed">
          Query across all {cases.length} indexed judgments by legal proposition, statutory provision, or factual issue.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk(question)
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Section 138 NI Act financial capacity or Section 25 Arms Act"
            className="flex-1 h-11 px-3.5 border border-black text-xs text-black focus:outline-none"
          />
          <button
            type="submit"
            className="bg-[#D91C1F] hover:bg-[#b51518] text-white px-6 h-11 text-[11px] font-extrabold tracking-[0.14em] uppercase cursor-pointer"
          >
            ASK
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUERIES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setQuestion(sample)
                handleAsk(sample)
              }}
              className="border border-neutral-300 hover:border-black px-2.5 py-1 text-[11px] font-semibold text-neutral-700 cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>

        {submittedQuestion && (
          <div className="border-t-[1.5px] border-black pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold tracking-[0.12em] uppercase text-[#D91C1F]">
                MATCHING CITATIONS FOR &ldquo;{submittedQuestion}&rdquo;
              </span>
              <button
                type="button"
                onClick={() => handleFullSearch(submittedQuestion)}
                className="text-[10px] font-extrabold tracking-wider uppercase text-black hover:text-[#D91C1F] underline"
              >
                APPLY AS FILTER ↗
              </button>
            </div>

            {matchingCases.length === 0 ? (
              <p className="text-xs text-neutral-500 py-2">
                No matching precedents found in current index for &ldquo;{submittedQuestion}&rdquo;.
              </p>
            ) : (
              matchingCases.map((match) => (
                <div key={match.id} className="border border-neutral-300 p-3.5 bg-neutral-50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-black">
                      {match.title}
                    </span>
                    <span className="text-[11px] text-[#D91C1F] font-bold">
                      {match.citation || match.caseNumber}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                    {match.summary}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
