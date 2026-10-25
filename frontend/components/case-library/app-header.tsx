'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, Plus, X } from 'lucide-react'
import { useLibrary } from './library-provider'

const outlineButton =
  'inline-flex h-10 items-center gap-1.5 border-2 border-ink bg-ground px-4 text-[13px] font-extrabold uppercase tracking-wider text-ink hover:bg-ink hover:text-ground active:bg-surface transition-colors'

const solidButton =
  'inline-flex h-10 items-center gap-1.5 border-2 border-ink bg-ink px-4 text-[13px] font-extrabold uppercase tracking-wider text-ground hover:bg-accent hover:border-accent hover:text-ground transition-colors'

const mobileRow =
  'flex h-14 w-full items-center justify-between border-b-2 border-rule-soft text-[15px] font-bold tracking-wide text-ink hover:bg-surface'

export function AppHeader() {
  const { openDialog, notify } = useLibrary()
  const [menuOpen, setMenuOpen] = useState(false)

  const run = (action: () => void) => () => {
    setMenuOpen(false)
    action()
  }

  const actions = {
    ask: run(() => openDialog({ kind: 'ask' })),
    bulk: run(() => openDialog({ kind: 'bulk' })),
    add: run(() => openDialog({ kind: 'form' })),
    logout: run(() =>
      notify('There is no account session in this prototype, so there is nothing to log out of.', 'info'),
    ),
  }

  return (
    <header
      className="relative border-b-2 border-ink bg-ground"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setMenuOpen(false)
      }}
    >
      <div className="frame flex h-16 items-center justify-between max-md:gap-4 md:grid md:grid-cols-12 swiss-cols">
        <div className="flex min-w-0 items-center gap-3 md:col-span-3">
          <Link
            href="/"
            aria-label="Case Law Library, home"
            className="group flex items-center gap-2.5 text-[21px] font-[850] leading-none tracking-[-0.04em] text-ink"
          >
            <span className="flex size-7.5 items-center justify-center border-2 border-ink bg-ink text-[12px] font-black tracking-normal text-ground transition-colors group-hover:bg-accent group-hover:border-accent">
              <span className="text-ground">C</span>
              <span className="text-accent group-hover:text-ground">L</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span>LIBRARY</span>
              <span className="size-1.5 bg-accent" aria-hidden="true" />
            </span>
          </Link>
          <span className="label-caps border border-rule-soft bg-surface px-1.5 py-0.5 text-[9px] font-black tracking-widest text-ink-subtle">
            Proto
          </span>
        </div>

        <nav
          aria-label="Library actions"
          className="hidden items-center gap-2.5 md:col-span-9 md:flex"
        >
          <button type="button" className={outlineButton} onClick={actions.ask}>
            Ask Library
          </button>
          <button type="button" className={outlineButton} onClick={actions.bulk}>
            Bulk Add
          </button>
          <button type="button" onClick={actions.add} className={solidButton}>
            <Plus className="size-4" strokeWidth={3} aria-hidden="true" />
            Add Case
          </button>
          <button
            type="button"
            onClick={actions.logout}
            className="ml-auto inline-flex h-10 items-center px-2 text-[12px] font-extrabold uppercase tracking-wider text-ink-subtle hover:text-accent hover:underline decoration-2 underline-offset-4"
          >
            Log Out
          </button>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 border-2 border-ink bg-ground px-3 text-[13px] font-bold text-ink hover:bg-ink hover:text-ground md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-actions"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="size-4" aria-hidden="true" />
          ) : (
            <Menu className="size-4" aria-hidden="true" />
          )}
          Menu
        </button>
      </div>

      {menuOpen && (
        <nav
          id="mobile-actions"
          aria-label="Library actions"
          className="absolute inset-x-0 top-full z-30 border-b-2 border-ink bg-ground px-5 pb-5 pt-1 md:hidden"
        >
          <ul>
            <li>
              <button type="button" onClick={actions.ask} className={mobileRow}>
                Ask the Library
                <span aria-hidden="true">→</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={actions.bulk} className={mobileRow}>
                Bulk Add
                <span aria-hidden="true">→</span>
              </button>
            </li>
            <li>
              <button type="button" onClick={actions.logout} className={mobileRow}>
                Log Out
              </button>
            </li>
          </ul>
          <button
            type="button"
            onClick={actions.add}
            className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 border-2 border-ink bg-ink text-[14px] font-bold text-ground hover:bg-ground hover:text-ink"
          >
            <Plus className="size-4" strokeWidth={2.5} aria-hidden="true" />
            Add a Case
          </button>
        </nav>
      )}
    </header>
  )
}
