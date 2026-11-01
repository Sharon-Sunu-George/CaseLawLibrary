'use client'

import { AppHeader } from './app-header'
import { DialogHost } from './dialog-host'
import { LibraryProvider } from './library-provider'
import { StatusRegion } from './status-region'

export function LibraryShell({ children }: { children: React.ReactNode }) {
  return (
    <LibraryProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:border-2 focus:border-black focus:bg-white focus:px-4 focus:py-3 focus:text-[14px] focus:font-bold focus:text-black"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col selection:bg-[#D91C1F] selection:text-white">
        <AppHeader />
        <StatusRegion />
        <main id="main" className="flex-1 w-full max-w-[1440px] mx-auto border-x-0 xl:border-x-[1.5px] border-black">
          {children}
        </main>
        <footer className="w-full bg-[#0A0A0A] text-white border-t border-black">
          <div className="max-w-[1440px] mx-auto px-5 sm:px-7 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-8">
            <div className="flex items-center gap-2.5 shrink-0 md:w-[270px]">
              <span className="w-2 h-2 bg-[#D91C1F] inline-block shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-extrabold tracking-[0.14em] uppercase text-white">
                SAMPLE DATA
              </span>
            </div>
            <div className="hidden md:block w-[1px] h-7 bg-neutral-600 shrink-0" aria-hidden="true" />
            <p className="text-[12px] text-neutral-300 leading-relaxed">
              Illustrative prototype. Every record is sample data adapted for design review, not a verified judgment. No backend is connected, and changes made here last only until the page is refreshed.
            </p>
          </div>
        </footer>
      </div>
      <DialogHost />
    </LibraryProvider>
  )
}
