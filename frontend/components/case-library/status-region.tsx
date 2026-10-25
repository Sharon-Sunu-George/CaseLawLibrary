'use client'

import { Check, Info, X } from 'lucide-react'
import { useLibrary } from './library-provider'

export function StatusRegion() {
  const { notice, dismissNotice } = useLibrary()

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex justify-center md:inset-x-auto md:bottom-6 md:left-6 md:justify-start"
    >
      {notice && (
        <div
          key={notice.id}
          className="on-ink pointer-events-auto flex max-w-md items-start gap-3 border-2 border-ground bg-ink py-3 pl-4 pr-2 text-[14px] leading-[1.5] text-ground outline outline-2 outline-ink"
        >
          {notice.tone === 'success' ? (
            <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} aria-hidden="true" />
          )}
          <p className="min-w-0 flex-1">{notice.message}</p>
          <button
            type="button"
            onClick={dismissNotice}
            aria-label="Dismiss message"
            className="inline-flex size-8 shrink-0 items-center justify-center text-ground hover:bg-ground hover:text-ink"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
