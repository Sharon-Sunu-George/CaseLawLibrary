'use client'

import { useState } from 'react'
import type { CaseRecord } from '@/lib/case-types'
import { useLibrary } from './library-provider'
import { Modal } from './ui'

export function BulkAddDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addCases, cases } = useLibrary()
  const [bulkText, setBulkText] = useState('')

  const handleBulkImport = (e: React.FormEvent) => {
    e.preventDefault()
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length === 0) return

    const todayIso = '2026-10-18'
    const newRecords: CaseRecord[] = lines.map((line, idx) => {
      const parts = line.split('|').map((p) => p.trim())
      const title = parts[0] || `Imported Precedent #${cases.length + idx + 1}`
      const citation = parts[1] || `2026 IND ${1200 + idx}`
      const court = parts[2] || 'Supreme Court of India'
      const code = parts[3] || 'Other'
      return {
        id: `case-bulk-${Date.now()}-${idx}`,
        title,
        citation,
        caseNumber: citation,
        court,
        jurisdiction: court.includes('Delhi')
          ? 'Delhi'
          : court.includes('Karnataka')
            ? 'Karnataka'
            : 'India',
        code,
        decisionDate: todayIso,
        decidedDisplay: '18 Oct 2026',
        needsReview: true,
        summary:
          parts[4] ||
          'Imported via Bulk Add for editorial verification. Review judgment ratio, statutory citations, and headnote tags.',
        fullNotes: parts[4] || 'Imported via Bulk Add for editorial verification.',
        tags: ['bulk import', 'needs verification', code.toLowerCase()],
        source: 'Bulk Import',
      }
    })

    addCases(newRecords)
    setBulkText('')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setBulkText('')
        onClose()
      }}
      size="md"
      title="BULK ADD CASE RECORDS"
    >
      <form onSubmit={handleBulkImport} className="space-y-4">
        <p className="text-xs text-neutral-600 leading-relaxed">
          Enter one record per line using pipe-separated fields:{' '}
          <code className="bg-neutral-100 px-1.5 py-0.5 text-[11px] font-bold">
            Title | Citation | Court | Code | Summary
          </code>
        </p>
        <textarea
          rows={5}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder="State of Maharashtra v. R.K. Deshmukh | 2026 INSC 1204 | Supreme Court of India | Code of Civil Procedure | Principles governing condonation of delay..."
          className="w-full border border-black p-3 text-xs text-black focus:outline-none"
          required
        />
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-black px-5 h-10 text-[11px] font-extrabold tracking-[0.12em] uppercase text-black cursor-pointer hover:bg-neutral-100"
          >
            CANCEL
          </button>
          <button
            type="submit"
            className="bg-[#D91C1F] hover:bg-[#b51518] text-white px-6 h-10 text-[11px] font-extrabold tracking-[0.12em] uppercase cursor-pointer"
          >
            IMPORT RECORDS
          </button>
        </div>
      </form>
    </Modal>
  )
}
