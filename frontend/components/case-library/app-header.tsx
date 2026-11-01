'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLibrary } from './library-provider'

export function AppHeader() {
  const { openDialog, notify, isAuthenticated, toggleAuth } = useLibrary()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleAddCase = () => {
    if (!isAuthenticated) {
      notify('Please log in to add a new case record.', 'info')
      return
    }
    openDialog({ kind: 'form' })
  }

  const handleBulkAdd = () => {
    if (!isAuthenticated) {
      notify('Sign in required to bulk add records.', 'info')
      return
    }
    openDialog({ kind: 'bulk' })
  }

  return (
    <header className="w-full border-b-[1.5px] border-black bg-white sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-7 py-2.5 sm:py-0 sm:h-14 flex items-center justify-between gap-x-4">
        {/* Left Nav */}
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer focus:outline-none shrink-0"
          >
            <span className="w-7 h-7 bg-black text-white font-extrabold text-[11px] tracking-wider flex items-center justify-center">
              CL
            </span>
            <span className="text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-black flex items-center gap-2">
              LIBRARY
              <span className="w-2 h-2 bg-[#D91C1F] inline-block" aria-hidden="true" />
            </span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden sm:flex items-center gap-7 shrink-0"
          >
            <button
              type="button"
              onClick={() => openDialog({ kind: 'ask' })}
              className="text-[11px] font-bold tracking-[0.12em] uppercase text-black hover:text-[#D91C1F] transition-colors cursor-pointer whitespace-nowrap"
            >
              ASK LIBRARY
            </button>
            <button
              type="button"
              onClick={handleBulkAdd}
              className="text-[11px] font-bold tracking-[0.12em] uppercase text-black hover:text-[#D91C1F] transition-colors cursor-pointer whitespace-nowrap"
            >
              BULK ADD
            </button>
          </nav>
        </div>

        {/* Right Actions Desktop */}
        <div className="hidden sm:flex items-center justify-end gap-5 shrink-0">
          <span className="w-[1.5px] h-7 bg-black" aria-hidden="true" />
          <button
            type="button"
            onClick={handleAddCase}
            className="bg-black hover:bg-[#D91C1F] text-white text-[11px] font-extrabold tracking-[0.12em] uppercase px-4 h-8 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>+ ADD CASE</span>
          </button>
          <button
            type="button"
            onClick={toggleAuth}
            className="text-[11px] font-bold tracking-[0.12em] uppercase text-black hover:text-[#D91C1F] transition-colors cursor-pointer whitespace-nowrap"
          >
            {isAuthenticated ? 'LOG OUT' : 'LOG IN'}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onClick={handleAddCase}
            className="bg-black hover:bg-[#D91C1F] text-white text-[10px] font-extrabold tracking-[0.1em] uppercase px-2.5 h-7 flex items-center"
          >
            + ADD
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            className="p-1 border border-black text-black"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-black bg-white px-4 py-3 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              openDialog({ kind: 'ask' })
            }}
            className="text-left text-[11px] font-bold tracking-[0.12em] uppercase text-black py-1.5 hover:text-[#D91C1F]"
          >
            ASK LIBRARY
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              handleBulkAdd()
            }}
            className="text-left text-[11px] font-bold tracking-[0.12em] uppercase text-black py-1.5 hover:text-[#D91C1F]"
          >
            BULK ADD
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              toggleAuth()
            }}
            className="text-left text-[11px] font-bold tracking-[0.12em] uppercase text-black py-1.5 hover:text-[#D91C1F]"
          >
            {isAuthenticated ? 'LOG OUT' : 'LOG IN'}
          </button>
        </div>
      )}
    </header>
  )
}
