'use client'

import { RefreshCw } from 'lucide-react'

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="px-6 py-16 text-center border-b-[1.5px] border-black bg-white">
      <div className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#D91C1F] mb-2">
        00 / NO MATCHING RECORDS
      </div>
      <p className="text-lg font-extrabold text-black mb-2">
        No case records match the active search or filter criteria.
      </p>
      <p className="text-xs text-neutral-600 mb-5">
        Reset your query or adjust the court, legal code, or review status filters.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="bg-black hover:bg-[#D91C1F] text-white text-[11px] font-extrabold tracking-[0.14em] uppercase px-6 h-10 transition-colors cursor-pointer"
      >
        RESET FILTERS
      </button>
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="px-6 py-16 text-center border-b-[1.5px] border-black bg-white">
      <div className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-[#D91C1F] mb-2">
        ERROR / UNABLE TO LOAD RESULTS
      </div>
      <p className="text-lg font-extrabold text-black mb-2">
        We couldn&apos;t load the results
      </p>
      <p className="text-xs text-neutral-600 mb-5">
        The search did not complete. Your search terms and filters have been kept, so you can try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="bg-black hover:bg-[#D91C1F] text-white text-[11px] font-extrabold tracking-[0.14em] uppercase px-6 h-10 inline-flex items-center gap-2 transition-colors cursor-pointer"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        TRY AGAIN
      </button>
    </div>
  )
}

export function LoadingState() {
  return (
    <div aria-hidden="true" className="divide-y divide-neutral-200 border-b-[1.5px] border-black bg-white">
      {[0, 1, 2].map((row) => (
        <div
          key={row}
          className="grid grid-cols-1 md:grid-cols-[23.5%_53.5%_23%] py-6 px-5 lg:px-7 animate-pulse"
        >
          <div className="space-y-2 pb-4 md:pb-0">
            <div className="h-4 w-12 bg-neutral-200" />
            <div className="h-5 w-3/4 bg-neutral-200" />
            <div className="h-4 w-1/2 bg-neutral-200" />
          </div>
          <div className="space-y-3 md:border-l border-neutral-200 md:px-7 py-4 md:py-0">
            <div className="h-6 w-5/6 bg-neutral-200" />
            <div className="h-4 w-1/3 bg-neutral-200" />
            <div className="h-4 w-full bg-neutral-200" />
            <div className="h-4 w-4/5 bg-neutral-200" />
            <div className="h-3 w-1/2 bg-neutral-200 pt-1" />
          </div>
          <div className="space-y-3 md:border-l border-neutral-200 md:px-7 pt-4 md:pt-0">
            <div className="h-3 w-16 bg-neutral-200" />
            <div className="h-4 w-28 bg-neutral-200" />
            <div className="h-3 w-16 bg-neutral-200 pt-2" />
            <div className="h-4 w-24 bg-neutral-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
