import type { DocumentMetadata } from './case-types'

const DB_NAME = 'caselaw_library_db'
const DB_VERSION = 1
const STORE_NAME = 'case_documents'
export const ORPHAN_STORAGE_KEY = 'caselaw_orphaned_docs'

export const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB
export const MAX_PDF_SIZE_DISPLAY = '25 MB'

export type StoredDocument = {
  /** The primary key in the store: either a documentId (e.g. doc-case1-timestamp) or legacy caseId */
  caseId: string
  /** The associated case identifier */
  targetCaseId?: string
  blob: Blob
  metadata: DocumentMetadata
}

/**
 * Open connection to the IndexedDB database.
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'caseId' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB.'))
  })
}

/**
 * Validate that a file is a valid PDF within file size limits.
 */
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  const isPdfMime = file.type === 'application/pdf'
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf')

  if (!isPdfMime && !isPdfExt) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a valid PDF document (.pdf).',
    }
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum supported size is ${MAX_PDF_SIZE_DISPLAY}.`,
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The selected PDF file appears to be empty (0 bytes).',
    }
  }

  return { valid: true }
}

/**
 * Format bytes to readable human string (KB, MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(2)} MB`
}

/**
 * Save a document into IndexedDB under a unique primary key (documentId or caseId).
 * Supports staged non-destructive storage where new documents are staged under a distinct key
 * before any old document reference is deleted.
 */
export async function saveDocument(
  primaryKey: string,
  file: File | Blob,
  fileName?: string,
  associatedCaseId?: string,
): Promise<DocumentMetadata> {
  const metadata: DocumentMetadata = {
    documentId: primaryKey,
    fileName: fileName || (file instanceof File ? file.name : 'judgment.pdf'),
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
    mimeType: file.type || 'application/pdf',
  }

  const record: StoredDocument = {
    caseId: primaryKey,
    targetCaseId: associatedCaseId || primaryKey,
    blob: file,
    metadata,
  }

  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.put(record)

    request.onsuccess = () => resolve(metadata)
    request.onerror = () => reject(request.error || new Error('Failed to save document in IndexedDB.'))
  })
}

/**
 * Retrieve a PDF document record from IndexedDB by primaryKey (documentId or legacy caseId).
 * If primaryKey is not found, attempts fallback lookup matching targetCaseId.
 */
export async function getDocument(primaryKey: string, fallbackCaseId?: string): Promise<StoredDocument | null> {
  try {
    const db = await openDB()
    const directResult = await new Promise<StoredDocument | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get(primaryKey)

      request.onsuccess = () => resolve((request.result as StoredDocument) || null)
      request.onerror = () => reject(request.error || new Error('Failed to get document from IndexedDB.'))
    })

    if (directResult) return directResult

    // Fallback: If not found and fallbackCaseId differs, try fallback lookup
    if (fallbackCaseId && fallbackCaseId !== primaryKey) {
      return await new Promise<StoredDocument | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly')
        const store = tx.objectStore(STORE_NAME)
        const request = store.get(fallbackCaseId)

        request.onsuccess = () => resolve((request.result as StoredDocument) || null)
        request.onerror = () => reject(request.error || new Error('Failed to get document from IndexedDB.'))
      })
    }

    return null
  } catch (err) {
    console.error('Error fetching document from IndexedDB:', err)
    return null
  }
}

/**
 * Delete a PDF document record by primaryKey from IndexedDB.
 */
export async function deleteDocument(primaryKey: string): Promise<boolean> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.delete(primaryKey)

      request.onsuccess = () => resolve(true)
      request.onerror = () => reject(request.error || new Error('Failed to delete document from IndexedDB.'))
    })
  } catch (err) {
    console.error('Error deleting document from IndexedDB:', err)
    return false
  }
}

/**
 * Retrieve all PDF document records from IndexedDB.
 */
export async function getAllDocuments(): Promise<StoredDocument[]> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve((request.result as StoredDocument[]) || [])
      }
      request.onerror = () => reject(request.error || new Error('Failed to get all documents from IndexedDB.'))
    })
  } catch (err) {
    console.error('Error fetching all documents from IndexedDB:', err)
    return []
  }
}

/* =========================================================================
   Orphan Document Tracking & Sweeping Utilities
   ========================================================================= */

/**
 * Record an orphaned document identifier into LocalStorage for background cleanup.
 */
export function recordOrphanedDocument(docOrCaseId: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(ORPHAN_STORAGE_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    if (!list.includes(docOrCaseId)) {
      list.push(docOrCaseId)
      window.localStorage.setItem(ORPHAN_STORAGE_KEY, JSON.stringify(list))
    }
  } catch (e) {
    console.warn('Failed to record orphaned document in localStorage:', e)
  }
}

/**
 * Retrieve all orphaned document identifiers.
 */
export function getOrphanedDocumentIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(ORPHAN_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * Clear a document identifier from the orphaned registry.
 */
export function clearOrphanedDocumentId(docOrCaseId: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(ORPHAN_STORAGE_KEY)
    if (!raw) return
    const list: string[] = JSON.parse(raw)
    const filtered = list.filter((id) => id !== docOrCaseId)
    window.localStorage.setItem(ORPHAN_STORAGE_KEY, JSON.stringify(filtered))
  } catch {
    // Ignore error
  }
}

/**
 * Guarded, best-effort orphan document sweeper.
 * Runs ONLY when authoritative storage is loaded. Compares all stored documents in IndexedDB
 * against the set of valid case IDs and valid document IDs.
 */
export async function purgeOrphanedDocuments(
  validCaseIds: Set<string>,
  validDocumentIds: Set<string>,
): Promise<number> {
  let purgedCount = 0
  try {
    const allDocs = await getAllDocuments()
    for (const doc of allDocs) {
      const isLinkedByDocId = doc.metadata?.documentId && validDocumentIds.has(doc.metadata.documentId)
      const isLinkedByCaseId = validCaseIds.has(doc.caseId) || (doc.targetCaseId && validCaseIds.has(doc.targetCaseId))

      if (!isLinkedByDocId && !isLinkedByCaseId) {
        await deleteDocument(doc.caseId)
        clearOrphanedDocumentId(doc.caseId)
        purgedCount++
      }
    }

    // Also sweep any explicitly recorded orphan IDs
    const recordedOrphans = getOrphanedDocumentIds()
    for (const orphanId of recordedOrphans) {
      if (!validCaseIds.has(orphanId) && !validDocumentIds.has(orphanId)) {
        await deleteDocument(orphanId)
        clearOrphanedDocumentId(orphanId)
      }
    }
  } catch (err) {
    console.warn('Background orphan cleanup encountered an error:', err)
  }
  return purgedCount
}
