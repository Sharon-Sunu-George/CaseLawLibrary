'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { CaseRecord } from '@/lib/case-types'
import { SAMPLE_CASES } from '@/lib/cases-data'

export type DialogState =
  | { kind: 'ask' }
  | { kind: 'bulk' }
  | { kind: 'form'; caseId?: string }
  | null

export type Notice = { id: number; message: string; tone: 'success' | 'info' }

type LibraryContextValue = {
  cases: CaseRecord[]
  saveCase: (record: CaseRecord, isNew?: boolean) => void
  deleteCase: (id: string, title?: string) => void
  addCases: (records: CaseRecord[]) => void
  dialog: DialogState
  openDialog: (dialog: NonNullable<DialogState>) => void
  closeDialog: () => void
  notice: Notice | null
  notify: (message: string, tone?: Notice['tone']) => void
  dismissNotice: () => void
  /** Query string of the last results view, so the detail page can link back to it. */
  lastQuery: string
  setLastQuery: (query: string) => void
  isAuthenticated: boolean
  toggleAuth: () => void
}

const LibraryContext = createContext<LibraryContextValue | null>(null)

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<CaseRecord[]>(SAMPLE_CASES)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [lastQuery, setLastQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(noticeTimer.current), [])

  const dismissNotice = useCallback(() => {
    clearTimeout(noticeTimer.current)
    setNotice(null)
  }, [])

  const notify = useCallback((message: string, tone: Notice['tone'] = 'success') => {
    clearTimeout(noticeTimer.current)
    setNotice({ id: Date.now(), message, tone })
    noticeTimer.current = setTimeout(() => setNotice(null), 3500)
  }, [])

  const toggleAuth = useCallback(() => {
    setIsAuthenticated((prev) => {
      const next = !prev
      notify(
        next
          ? 'Researcher session restored.'
          : 'Logged out. Read-only mode enabled (click LOG IN to restore edit access).',
        'info',
      )
      return next
    })
  }, [notify])

  const saveCase = useCallback(
    (record: CaseRecord, isNew?: boolean) => {
      setCases((current) => {
        const exists = current.some((item) => item.id === record.id)
        if (exists && !isNew) {
          return current.map((item) => (item.id === record.id ? record : item))
        }
        return [record, ...current]
      })
      notify(
        isNew
          ? `Added "${record.title}" to the research index.`
          : `Updated case record "${record.title}".`,
      )
    },
    [notify],
  )

  const deleteCase = useCallback(
    (id: string, title?: string) => {
      setCases((current) => current.filter((item) => item.id !== id))
      notify(`Removed "${title || 'case'}" from the index.`)
    },
    [notify],
  )

  const addCases = useCallback(
    (records: CaseRecord[]) => {
      setCases((current) => [...records, ...current])
      notify(
        `Bulk imported ${records.length} case record${
          records.length > 1 ? 's' : ''
        }.`,
      )
    },
    [notify],
  )

  const value = useMemo<LibraryContextValue>(
    () => ({
      cases,
      saveCase,
      deleteCase,
      addCases,
      dialog,
      openDialog: setDialog,
      closeDialog: () => setDialog(null),
      notice,
      notify,
      dismissNotice,
      lastQuery,
      setLastQuery,
      isAuthenticated,
      toggleAuth,
    }),
    [
      cases,
      saveCase,
      deleteCase,
      addCases,
      dialog,
      notice,
      notify,
      dismissNotice,
      lastQuery,
      isAuthenticated,
      toggleAuth,
    ],
  )

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
}

export function useLibrary(): LibraryContextValue {
  const context = useContext(LibraryContext)
  if (!context) throw new Error('useLibrary must be used within LibraryProvider')
  return context
}
