'use client'

import { useState } from 'react'
import type { CaseFilters as Filters } from '@/lib/case-types'

type Props = {
  applied: Filters
  courts: string[]
  codes: string[]
  onSubmit: (draft: Filters) => void
  onClear: () => void
}

export function CaseSearch({ applied, courts, codes, onSubmit, onClear }: Props) {
  const [searchInput, setSearchInput] = useState(applied.query)
  const [selectedCourt, setSelectedCourt] = useState(applied.court || 'ALL')
  const [selectedCode, setSelectedCode] = useState(applied.code || 'ALL')
  const [needsReviewOnly, setNeedsReviewOnly] = useState(applied.reviewOnly)

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...applied,
      query: searchInput,
      court: selectedCourt === 'ALL' ? '' : selectedCourt,
      code: selectedCode === 'ALL' ? '' : selectedCode,
      reviewOnly: needsReviewOnly,
    })
  }

  const handleClear = () => {
    setSearchInput('')
    setSelectedCourt('ALL')
    setSelectedCode('ALL')
    setNeedsReviewOnly(false)
    onClear()
  }

  const handleCourtChange = (val: string) => {
    setSelectedCourt(val)
    onSubmit({
      ...applied,
      query: searchInput,
      court: val === 'ALL' ? '' : val,
      code: selectedCode === 'ALL' ? '' : selectedCode,
      reviewOnly: needsReviewOnly,
    })
  }

  const handleCodeChange = (val: string) => {
    setSelectedCode(val)
    onSubmit({
      ...applied,
      query: searchInput,
      court: selectedCourt === 'ALL' ? '' : selectedCourt,
      code: val === 'ALL' ? '' : val,
      reviewOnly: needsReviewOnly,
    })
  }

  const handleReviewToggle = (checked: boolean) => {
    setNeedsReviewOnly(checked)
    onSubmit({
      ...applied,
      query: searchInput,
      court: selectedCourt === 'ALL' ? '' : selectedCourt,
      code: selectedCode === 'ALL' ? '' : selectedCode,
      reviewOnly: checked,
    })
  }

  return (
    <section
      aria-label="Search and Filter"
      className="grid grid-cols-1 md:grid-cols-[118px_1fr] lg:grid-cols-[132px_1fr] border-b-[1.5px] border-black bg-white"
    >
      {/* Left Section Rail 02 */}
      <div className="md:border-r-[1.5px] border-b md:border-b-0 border-black px-4 sm:px-5 py-3 md:py-6">
        <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#D91C1F] leading-[1.35]">
          <div>02 /</div>
          <div>SEARCH &amp;</div>
          <div>FILTER</div>
        </div>
      </div>

      {/* Main Search & Filter Controls */}
      <div className="px-5 sm:px-8 py-5 sm:py-6 space-y-5">
        {/* Row 1: Search Bar */}
        <form onSubmit={handleSearchSubmit}>
          <label
            htmlFor="case-search-input"
            className="block text-[10.5px] font-extrabold tracking-[0.13em] uppercase text-black mb-2"
          >
            SEARCH CASES
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 flex items-center border border-neutral-300 focus-within:border-black bg-white h-11 px-3.5 transition-colors">
              <svg
                className="w-4 h-4 text-neutral-500 mr-2.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
                />
              </svg>
              <input
                id="case-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Title, citation, court, or legal topic"
                className="w-full text-[13.5px] text-black placeholder:text-neutral-400 bg-transparent focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="bg-[#D91C1F] hover:bg-[#b51518] text-white text-[11.5px] font-extrabold tracking-[0.14em] uppercase px-8 sm:px-10 h-11 transition-colors cursor-pointer shrink-0"
              >
                SEARCH
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-[11.5px] font-extrabold tracking-[0.12em] uppercase text-black underline underline-offset-4 px-3 h-11 hover:text-[#D91C1F] transition-colors cursor-pointer shrink-0"
              >
                CLEAR
              </button>
            </div>
          </div>
        </form>

        {/* Row 2: Court, Code, Needs Review Only */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_auto] items-end gap-4">
          {/* Court Filter */}
          <div>
            <label
              htmlFor="court-filter"
              className="block text-[10.5px] font-extrabold tracking-[0.13em] uppercase text-black mb-1.5"
            >
              COURT
            </label>
            <div className="relative">
              <select
                id="court-filter"
                value={selectedCourt}
                onChange={(e) => handleCourtChange(e.target.value)}
                className="w-full h-10 px-3.5 pr-9 border border-neutral-300 focus:border-black bg-white text-[13px] text-black appearance-none focus:outline-none cursor-pointer"
              >
                <option value="ALL">All courts</option>
                {courts.map((court) => (
                  <option key={court} value={court}>
                    {court}
                  </option>
                ))}
              </select>
              <svg
                className="w-3.5 h-3.5 text-black pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden="true"
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-[1.5px] h-10 bg-black" aria-hidden="true" />

          {/* Code Filter */}
          <div>
            <label
              htmlFor="code-filter"
              className="block text-[10.5px] font-extrabold tracking-[0.13em] uppercase text-black mb-1.5"
            >
              CODE
            </label>
            <div className="relative">
              <select
                id="code-filter"
                value={selectedCode}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full h-10 px-3.5 pr-9 border border-neutral-300 focus:border-black bg-white text-[13px] text-black appearance-none focus:outline-none cursor-pointer"
              >
                <option value="ALL">All codes</option>
                {codes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <svg
                className="w-3.5 h-3.5 text-black pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden="true"
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-[1.5px] h-10 bg-black" aria-hidden="true" />

          {/* Needs Review Only Checkbox */}
          <label className="flex items-center gap-2.5 h-10 px-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={needsReviewOnly}
              onChange={(e) => handleReviewToggle(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 border-[1.5px] flex items-center justify-center transition-colors ${
                needsReviewOnly ? 'bg-black border-black text-white' : 'bg-white border-neutral-500'
              }`}
              aria-hidden="true"
            >
              {needsReviewOnly && (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="w-2 h-2 bg-[#D91C1F] inline-block shrink-0" aria-hidden="true" />
            <span className="text-[12.5px] font-bold text-black whitespace-nowrap">
              Needs review only
            </span>
          </label>
        </div>
      </div>
    </section>
  )
}
