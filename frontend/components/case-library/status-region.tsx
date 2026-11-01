'use client'

import { useLibrary } from './library-provider'

export function StatusRegion() {
  const { notice, dismissNotice } = useLibrary()

  if (!notice) return null

  return (
    <div
      role="status"
      className="w-full bg-[#0A0A0A] text-white border-b border-black px-4 sm:px-7 py-2 text-xs flex items-center justify-between sticky top-14 z-20"
    >
      <div className="flex items-center gap-2.5">
        <span className="w-2 h-2 bg-[#D91C1F] inline-block shrink-0" />
        <span className="font-medium tracking-wide">{notice.message}</span>
      </div>
      <button
        type="button"
        onClick={dismissNotice}
        className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white cursor-pointer ml-4 shrink-0"
      >
        DISMISS
      </button>
    </div>
  )
}
