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
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:border-2 focus:border-ink focus:bg-ground focus:px-4 focus:py-3 focus:text-[14px] focus:font-bold focus:text-ink"
      >
        Skip to main content
      </a>
      <div className="flex min-h-dvh flex-col">
        <AppHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <footer className="on-ink bg-ink text-ground">
          <div className="frame grid swiss-cols gap-y-3 py-8">
            <p className="label-caps md:col-span-3">Sample data</p>
            <p className="max-w-[68ch] text-[15px] leading-[1.5] md:col-span-9">
              Illustrative prototype. Every record is sample data adapted for
              design review, not a verified judgment. No backend is connected,
              and changes made here last only until the page is reloaded.
            </p>
          </div>
        </footer>
      </div>
      <DialogHost />
      <StatusRegion />
    </LibraryProvider>
  )
}
