'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { filtersToQueryString, DEFAULT_FILTERS, rankAskResults } from '@/lib/case-query'
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
    ? rankAskResults(submittedQuestion, cases, 5)
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
        <div className="border-l-2 border-[#D91C1F] pl-3 text-[11px] font-bold text-neutral-700 uppercase tracking-[0.08em]">
          Retrieved from indexed case records only. No AI-generated legal advice, holdings or citations are produced.
        </div>

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
                <div key={match.record.id} className="border border-neutral-300 p-3.5 bg-neutral-50">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={`/cases/${match.record.id}`}
                      className="text-xs font-extrabold text-black hover:text-[#D91C1F] underline underline-offset-2 transition-colors"
                    >
                      {match.record.title}
                    </Link>
                    <span className="text-[11px] text-[#D91C1F] font-bold">
                      {match.record.citation || match.record.caseNumber}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                    {match.snippet}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[10.5px] text-neutral-500 uppercase tracking-[0.08em]">
                      Relevance: {match.score}
                    </span>
                    <Link
                      href={`/cases/${match.record.id}`}
                      className="text-[10.5px] font-extrabold tracking-[0.1em] uppercase text-black hover:text-[#D91C1F] underline"
                    >
                      Open dossier ↗
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
