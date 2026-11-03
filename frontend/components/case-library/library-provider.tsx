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
import { loadStoredCases, saveStoredCases } from '@/lib/storage'
import {
  deleteDocument,
  purgeOrphanedDocuments,
  recordOrphanedDocument,
  saveDocument,
} from '@/lib/document-storage'

export type DialogState =
  | { kind: 'ask' }
  | { kind: 'bulk' }
  | { kind: 'form'; caseId?: string }
  | null

export type Notice = { id: number; message: string; tone: 'success' | 'info' }

type PendingMutation =
  | { type: 'save'; record: CaseRecord; isNew?: boolean }
  | { type: 'delete'; id: string; title?: string }
  | { type: 'add'; records: CaseRecord[] }

type LibraryContextValue = {
  cases: CaseRecord[]
  isHydrated: boolean
  saveCase: (
    record: CaseRecord,
    isNew?: boolean,
    attachment?: { file?: File; removeExisting?: boolean },
  ) => Promise<void>
  deleteCase: (id: string, title?: string) => Promise<void>
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
  const [isHydrated, setIsHydrated] = useState(false)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [lastQuery, setLastQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const isHydratedRef = useRef(false)
  const casesRef = useRef<CaseRecord[]>(SAMPLE_CASES)
  const pendingMutationsRef = useRef<PendingMutation[]>([])
  const mutationQueueRef = useRef<Promise<void>>(Promise.resolve())

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

  /**
   * Serializes async operations sequentially in strict FIFO order
   */
  const runExclusive = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const next = mutationQueueRef.current.then(task, task)
    mutationQueueRef.current = next.then(
      () => {},
      () => {},
    )
    return next
  }, [])

  // Helper function to apply a mutation purely to an array of cases
  const applyMutation = (base: CaseRecord[], mutation: PendingMutation): CaseRecord[] => {
    switch (mutation.type) {
      case 'save': {
        const exists = base.some((item) => item.id === mutation.record.id)
        if (exists && !mutation.isNew) {
          return base.map((item) => (item.id === mutation.record.id ? mutation.record : item))
        }
        return [mutation.record, ...base]
      }
      case 'delete': {
        return base.filter((item) => item.id !== mutation.id)
      }
      case 'add': {
        return [...mutation.records, ...base]
      }
    }
  }

  // Initial client hydration from localStorage with reconciliation of queued mutations
  // Idempotent under React Strict Mode double-invocation
  useEffect(() => {
    if (isHydratedRef.current) return

    const stored = loadStoredCases()
    let initialList = stored !== null ? stored : SAMPLE_CASES

    // Reconcile with any mutations that occurred before hydration finished
    if (pendingMutationsRef.current.length > 0) {
      for (const mutation of pendingMutationsRef.current) {
        initialList = applyMutation(initialList, mutation)
      }
      pendingMutationsRef.current = []

      // Persist the reconciled list and handle storage errors safely
      const persisted = saveStoredCases(initialList)
      if (!persisted) {
        notify(
          'Warning: Reconciled records updated in memory, but could not be saved to local storage.',
          'info',
        )
      }
    }

    casesRef.current = initialList
    setCases(initialList)
    isHydratedRef.current = true
    setIsHydrated(true)

    // Protected, non-blocking orphan cleanup: runs ONLY if valid persisted cases exist
    if (stored !== null && stored.length > 0) {
      setTimeout(() => {
        const validCaseIds = new Set(initialList.map((c) => c.id))
        const validDocIds = new Set<string>()
        for (const c of initialList) {
          if (c.pdfMetadata?.documentId) {
            validDocIds.add(c.pdfMetadata.documentId)
          }
        }
        purgeOrphanedDocuments(validCaseIds, validDocIds)
      }, 1000)
    }
  }, [notify])

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

  /**
   * Save a case with genuinely non-destructive staged PDF replacement and LocalStorage-first safety
   */
  const saveCase = useCallback(
    (
      record: CaseRecord,
      isNew?: boolean,
      attachment?: { file?: File; removeExisting?: boolean },
    ): Promise<void> => {
      return runExclusive(async () => {
        let finalRecord: CaseRecord = { ...record }
        const oldDocumentId = record.pdfMetadata?.documentId || record.id
        let newlyStagedDocId: string | null = null

        // 1. STAGED PDF REPLACEMENT / UPLOAD:
        // Save the new document under a distinct staged key before touching anything else.
        // The original PDF remains untouched in IndexedDB.
        if (attachment?.file) {
          try {
            newlyStagedDocId = `doc-${record.id}-${Date.now()}`
            const meta = await saveDocument(newlyStagedDocId, attachment.file, undefined, record.id)
            finalRecord.pdfMetadata = meta
          } catch (err) {
            console.error('Failed to save document in IndexedDB:', err)
            notify('Error: Could not save PDF to browser storage. Case was not updated.', 'info')
            throw err
          }
        } else if (attachment?.removeExisting) {
          // Metadata-First removal: strip metadata on the candidate record
          delete finalRecord.pdfMetadata
        }

        // 2. PERSIST CASE RECORD TO LOCALSTORAGE:
        const mutation: PendingMutation = { type: 'save', record: finalRecord, isNew }

        if (!isHydratedRef.current) {
          pendingMutationsRef.current.push(mutation)
          const optimistic = applyMutation(casesRef.current, mutation)
          casesRef.current = optimistic
          setCases(optimistic)
          notify(
            isNew
              ? `Added "${record.title}" to the research index.`
              : `Updated case record "${record.title}".`,
          )
          return
        }

        const nextCases = applyMutation(casesRef.current, mutation)
        casesRef.current = nextCases
        setCases(nextCases)

        const persisted = saveStoredCases(nextCases)

        // 3. FAILURE HANDLING & COMPENSATION:
        if (!persisted) {
          // If LocalStorage failed:
          // Discard only the newly staged document; the original document was never deleted.
          if (newlyStagedDocId) {
            try {
              await deleteDocument(newlyStagedDocId)
            } catch (cleanupErr) {
              console.error('Error cleaning up staged document:', cleanupErr)
            }
          }

          // Revert in-memory state
          const reverted = casesRef.current.filter((c) => c.id !== record.id)
          const original = cases.find((c) => c.id === record.id)
          const safeRevert = original ? [...reverted, original] : reverted
          casesRef.current = safeRevert
          setCases(safeRevert)

          notify(
            'Storage quota exceeded: Changes could not be saved to local storage. Original document was untouched.',
            'info',
          )
          throw new Error('Failed to save case to LocalStorage.')
        }

        // 4. CLEAN UP SUPERSEDED DOCUMENT AFTER CONFIRMED SUCCESS:
        // Now that LocalStorage has confirmed the new document reference is saved,
        // clean up the old document if one was replaced or removed.
        if (newlyStagedDocId && record.pdfMetadata) {
          try {
            await deleteDocument(oldDocumentId)
          } catch (err) {
            console.warn('Failed to delete superseded document; recorded as orphan:', err)
            recordOrphanedDocument(oldDocumentId)
          }
        } else if (attachment?.removeExisting) {
          try {
            await deleteDocument(oldDocumentId)
          } catch (err) {
            console.warn('Failed to delete removed document; recorded as orphan:', err)
            recordOrphanedDocument(oldDocumentId)
          }
        }

        notify(
          isNew
            ? `Added "${finalRecord.title}" to the research index.`
            : `Updated case record "${finalRecord.title}".`,
        )
      })
    },
    [cases, notify, runExclusive],
  )

  /**
   * Delete a case following the mandatory sequence:
   * 1. Persist case deletion to LocalStorage first.
   * 2. Delete associated document from IndexedDB second.
   * 3. Record orphan if cleanup fails without crashing.
   */
  const deleteCase = useCallback(
    (id: string, title?: string): Promise<void> => {
      return runExclusive(async () => {
        const targetCase = casesRef.current.find((c) => c.id === id)
        const documentIdToDelete = targetCase?.pdfMetadata?.documentId || id
        const mutation: PendingMutation = { type: 'delete', id, title }

        if (!isHydratedRef.current) {
          pendingMutationsRef.current.push(mutation)
          const optimistic = applyMutation(casesRef.current, mutation)
          casesRef.current = optimistic
          setCases(optimistic)
          notify(`Removed "${title || 'case'}" from the index.`)
          return
        }

        // 1. PERSIST CASE DELETION TO LOCALSTORAGE FIRST:
        const nextCases = applyMutation(casesRef.current, mutation)
        casesRef.current = nextCases
        setCases(nextCases)

        const persisted = saveStoredCases(nextCases)
        if (!persisted) {
          // Revert in-memory state
          if (targetCase) {
            const restored = [targetCase, ...casesRef.current]
            casesRef.current = restored
            setCases(restored)
          }
          notify(
            'Warning: Storage error. Case could not be deleted from storage. Document was preserved.',
            'info',
          )
          throw new Error('Failed to persist case deletion to LocalStorage.')
        }

        // 2. DELETE INDEXEDDB DOCUMENT SECOND:
        try {
          await deleteDocument(documentIdToDelete)
        } catch (err) {
          console.warn(`Failed to clean up document for deleted case ${id}:`, err)
          recordOrphanedDocument(documentIdToDelete)
        }

        notify(`Removed "${title || 'case'}" from the index.`)
      })
    },
    [notify, runExclusive],
  )

  const addCases = useCallback(
    (records: CaseRecord[]) => {
      const mutation: PendingMutation = { type: 'add', records }

      if (!isHydratedRef.current) {
        pendingMutationsRef.current.push(mutation)
        const optimistic = applyMutation(casesRef.current, mutation)
        casesRef.current = optimistic
        setCases(optimistic)
        notify(
          `Bulk imported ${records.length} case record${
            records.length > 1 ? 's' : ''
          }.`,
        )
        return
      }

      const nextCases = applyMutation(casesRef.current, mutation)
      casesRef.current = nextCases
      setCases(nextCases)

      const persisted = saveStoredCases(nextCases)
      if (!persisted) {
        notify(
          'Warning: Bulk records imported in memory, but could not be saved to local storage.',
          'info',
        )
        return
      }

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
      isHydrated,
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
      isHydrated,
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
