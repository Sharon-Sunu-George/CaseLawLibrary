import type { CaseRecord, DocumentMetadata, LibraryBackupPackage, BackupDocumentItem } from './case-types'
import { isValidCaseRecord, loadStoredCases, saveStoredCases } from './storage'
import {
  MAX_PDF_SIZE_BYTES,
  deleteDocument,
  getAllDocuments,
  getDocument,
  saveDocument,
  type StoredDocument,
} from './document-storage'

export const MAX_BACKUP_SIZE_BYTES = 100 * 1024 * 1024 // 100 MB max package size
export const CURRENT_BACKUP_VERSION = 1
export const BACKUP_GENERATOR = 'Case Law Library'

export type RestoreResult = {
  success: boolean
  totalCasesInBackup: number
  addedCasesCount: number
  skippedDuplicatesCount: number
  duplicateCaseIds: string[]
  totalDocsInBackup: number
  addedDocsCount: number
  skippedExistingDocsCount: number
  warnings: string[]
  error?: string
}

export type ValidationResult = {
  valid: boolean
  error?: string
  warnings: string[]
  casesCount: number
  documentsCount: number
  validCases: CaseRecord[]
  validDocuments: BackupDocumentItem[]
}

/**
 * Converts a Blob to a Base64 data string (browser safe).
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      // Node/testing environment fallback
      blob.arrayBuffer().then((buffer) => {
        const base64 = Buffer.from(buffer).toString('base64')
        resolve(`data:${blob.type || 'application/pdf'};base64,${base64}`)
      }).catch(reject)
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to convert Blob to base64 string.'))
      }
    }
    reader.onerror = () => reject(reader.error || new Error('FileReader encountered an error.'))
    reader.readAsDataURL(blob)
  })
}

/**
 * Converts a Base64 string to a Blob and validates that it represents a PDF.
 */
export function base64ToPdfBlob(base64Data: string, mimeType = 'application/pdf'): { blob: Blob; bytes: Uint8Array } {
  let cleanBase64 = base64Data
  if (base64Data.includes(',')) {
    cleanBase64 = base64Data.split(',')[1]
  }
  cleanBase64 = cleanBase64.replace(/\s/g, '')

  let binaryStr: string
  let bytes: Uint8Array
  if (typeof window === 'undefined' && typeof Buffer !== 'undefined') {
    const buf = Buffer.from(cleanBase64, 'base64')
    bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.length)
  } else {
    binaryStr = atob(cleanBase64)
    bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i)
    }
  }

  // Validate PDF magic number (%PDF- in ASCII: 0x25, 0x50, 0x44, 0x46, 0x2D)
  if (bytes.length < 5) {
    throw new Error('Document payload is too small to be a valid PDF.')
  }
  const isPdfHeader =
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46 && // F
    bytes[4] === 0x2d    // -

  if (!isPdfHeader) {
    throw new Error('Invalid PDF file signature (missing %PDF- header).')
  }

  const blob = new Blob([bytes], { type: mimeType || 'application/pdf' })
  return { blob, bytes }
}

/**
 * Validates ISO 8601 timestamp string.
 */
function isValidIsoDate(str: unknown): boolean {
  if (typeof str !== 'string' || str.trim().length === 0) return false
  const time = Date.parse(str)
  return !Number.isNaN(time)
}

/**
 * Comprehensive structural & safety validation of an imported backup object.
 */
export function validateBackupPackage(raw: unknown): ValidationResult {
  const warnings: string[] = []

  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Backup package is empty or invalid JSON.', warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
  }

  const pkg = raw as Record<string, unknown>

  // Version check
  if (pkg.version !== CURRENT_BACKUP_VERSION) {
    return {
      valid: false,
      error: `Unsupported backup version (${String(pkg.version)}). Current supported version is ${CURRENT_BACKUP_VERSION}.`,
      warnings,
      casesCount: 0,
      documentsCount: 0,
      validCases: [],
      validDocuments: [],
    }
  }

  // Timestamp check
  if (!isValidIsoDate(pkg.timestamp)) {
    return { valid: false, error: 'Backup package is missing a valid ISO creation timestamp.', warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
  }

  // Cases array validation
  if (!Array.isArray(pkg.cases)) {
    return { valid: false, error: 'Backup package missing "cases" array.', warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
  }

  const validCases: CaseRecord[] = []
  const seenCaseIdsInBackup = new Set<string>()

  for (let i = 0; i < pkg.cases.length; i++) {
    const item = pkg.cases[i]
    if (!isValidCaseRecord(item)) {
      return { valid: false, error: `Invalid case record at index ${i}.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }
    if (seenCaseIdsInBackup.has(item.id)) {
      return { valid: false, error: `Duplicate case ID "${item.id}" found inside the backup file.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }
    seenCaseIdsInBackup.add(item.id)
    validCases.push(item)
  }

  // Documents array validation
  if (!Array.isArray(pkg.documents)) {
    return { valid: false, error: 'Backup package missing "documents" array.', warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
  }

  const validDocuments: BackupDocumentItem[] = []
  const seenDocCaseIds = new Set<string>()
  let totalDecodedBytes = 0

  for (let i = 0; i < pkg.documents.length; i++) {
    const doc = pkg.documents[i]
    if (!doc || typeof doc !== 'object') {
      return { valid: false, error: `Invalid document entry at index ${i}.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }

    const d = doc as Record<string, unknown>
    if (typeof d.caseId !== 'string' || !d.caseId.trim()) {
      return { valid: false, error: `Document at index ${i} is missing a caseId.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }

    if (seenDocCaseIds.has(d.caseId)) {
      return { valid: false, error: `Duplicate document entry for caseId "${d.caseId}" in backup.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }
    seenDocCaseIds.add(d.caseId)

    // Validate metadata
    const meta = d.metadata as Record<string, unknown> | undefined
    if (!meta || typeof meta !== 'object') {
      return { valid: false, error: `Document for caseId "${d.caseId}" is missing metadata.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }

    if (typeof meta.fileName !== 'string' || !meta.fileName.toLowerCase().endsWith('.pdf')) {
      return { valid: false, error: `Document for caseId "${d.caseId}" has invalid fileName (must be a .pdf).`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }

    if (typeof meta.fileSize !== 'number' || meta.fileSize <= 0) {
      return { valid: false, error: `Document for caseId "${d.caseId}" has invalid fileSize.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }

    if (meta.fileSize > MAX_PDF_SIZE_BYTES) {
      return { valid: false, error: `Document "${meta.fileName}" exceeds 25 MB limit (${meta.fileSize} bytes).`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }

    if (!isValidIsoDate(meta.uploadedAt)) {
      return { valid: false, error: `Document for caseId "${d.caseId}" is missing a valid upload timestamp.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }

    if (typeof d.base64Data !== 'string' || !d.base64Data.trim()) {
      return { valid: false, error: `Document for caseId "${d.caseId}" has missing or empty base64 binary payload.`, warnings, casesCount: 0, documentsCount: 0, validCases: [], validDocuments: [] }
    }

    // Test Base64 decoding & PDF magic bytes
    try {
      const { bytes } = base64ToPdfBlob(d.base64Data, String(meta.mimeType || 'application/pdf'))
      if (Math.abs(bytes.length - meta.fileSize) > 4) {
        warnings.push(`Document "${meta.fileName}" byte length (${bytes.length}) differs from metadata size (${meta.fileSize}).`)
      }
      totalDecodedBytes += bytes.length
    } catch (err) {
      return {
        valid: false,
        error: `Document binary decoding failed for caseId "${d.caseId}": ${err instanceof Error ? err.message : String(err)}`,
        warnings,
        casesCount: 0,
        documentsCount: 0,
        validCases: [],
        validDocuments: [],
      }
    }

    validDocuments.push({
      caseId: d.caseId,
      metadata: {
        fileName: meta.fileName,
        fileSize: meta.fileSize,
        uploadedAt: meta.uploadedAt as string,
        mimeType: (meta.mimeType as string) || 'application/pdf',
      },
      base64Data: d.base64Data,
    })
  }

  // Cross-validation of case & document associations
  for (const caseItem of validCases) {
    if (caseItem.pdfMetadata) {
      const hasDoc = validDocuments.some((d) => d.caseId === caseItem.id)
      if (!hasDoc) {
        warnings.push(`Case "${caseItem.title}" (${caseItem.id}) declares pdfMetadata, but no corresponding binary document was found in backup package.`)
      }
    }
  }

  for (const docItem of validDocuments) {
    const hasCase = validCases.some((c) => c.id === docItem.caseId)
    if (!hasCase) {
      warnings.push(`Document for caseId "${docItem.caseId}" has no matching CaseRecord in the backup cases array.`)
    }
  }

  if (totalDecodedBytes > MAX_BACKUP_SIZE_BYTES) {
    return {
      valid: false,
      error: `Total backup binary payload (${Math.round(totalDecodedBytes / (1024 * 1024))} MB) exceeds the 100 MB limit.`,
      warnings,
      casesCount: 0,
      documentsCount: 0,
      validCases: [],
      validDocuments: [],
    }
  }

  return {
    valid: true,
    warnings,
    casesCount: validCases.length,
    documentsCount: validDocuments.length,
    validCases,
    validDocuments,
  }
}

/**
 * Generates a complete JSON backup package including all case records and attached PDF binaries.
 */
export async function createLibraryBackupPackage(cases: CaseRecord[]): Promise<LibraryBackupPackage> {
  const storedDocs = await getAllDocuments()
  const documents: BackupDocumentItem[] = []

  for (const doc of storedDocs) {
    try {
      const base64Data = await blobToBase64(doc.blob)
      documents.push({
        caseId: doc.caseId,
        metadata: doc.metadata,
        base64Data,
      })
    } catch (err) {
      console.error(`Failed to encode document for caseId ${doc.caseId}:`, err)
    }
  }

  const pkg: LibraryBackupPackage = {
    version: CURRENT_BACKUP_VERSION,
    generator: BACKUP_GENERATOR,
    timestamp: new Date().toISOString(),
    casesCount: cases.length,
    documentsCount: documents.length,
    cases,
    documents,
  }

  return pkg
}

/**
 * Triggers a browser download of a complete JSON backup file.
 */
export async function downloadJsonBackup(cases: CaseRecord[]): Promise<LibraryBackupPackage> {
  const pkg = await createLibraryBackupPackage(cases)
  const jsonStr = JSON.stringify(pkg, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })

  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `case-law-library-backup-${dateStr}.json`

  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return pkg
}

/**
 * Restores a library backup with two-phase commit, duplicate detection, and full rollback.
 */
export async function restoreLibraryBackup(
  rawBackup: unknown,
  existingCases: CaseRecord[],
): Promise<RestoreResult> {
  // 1. Validation & Staging Phase
  const validation = validateBackupPackage(rawBackup)
  if (!validation.valid) {
    return {
      success: false,
      totalCasesInBackup: 0,
      addedCasesCount: 0,
      skippedDuplicatesCount: 0,
      duplicateCaseIds: [],
      totalDocsInBackup: 0,
      addedDocsCount: 0,
      skippedExistingDocsCount: 0,
      warnings: validation.warnings,
      error: validation.error,
    }
  }

  const existingIds = new Set(existingCases.map((c) => c.id))
  const existingStoredDocs = await getAllDocuments()
  const existingDocCaseIds = new Set(existingStoredDocs.map((d) => d.caseId))

  const duplicateCaseIds: string[] = []
  const stagedCasesToAdd: CaseRecord[] = []

  for (const incomingCase of validation.validCases) {
    if (existingIds.has(incomingCase.id)) {
      duplicateCaseIds.push(incomingCase.id)
    } else {
      // Check if document association exists; sanitize if missing
      const cleanCase = { ...incomingCase }
      if (cleanCase.pdfMetadata) {
        const hasIncomingDoc = validation.validDocuments.some((d) => d.caseId === cleanCase.id)
        if (!hasIncomingDoc) {
          delete cleanCase.pdfMetadata
        }
      }
      stagedCasesToAdd.push(cleanCase)
    }
  }

  // Stage documents to add (never overwrite existing documents)
  const stagedDocsToAdd: Array<{ caseId: string; blob: Blob; metadata: DocumentMetadata }> = []
  let skippedExistingDocsCount = 0

  for (const incomingDoc of validation.validDocuments) {
    if (existingDocCaseIds.has(incomingDoc.caseId)) {
      skippedExistingDocsCount++
    } else {
      const { blob } = base64ToPdfBlob(incomingDoc.base64Data, incomingDoc.metadata.mimeType)
      stagedDocsToAdd.push({
        caseId: incomingDoc.caseId,
        blob,
        metadata: incomingDoc.metadata,
      })
    }
  }

  // 2. Multi-Store Two-Phase Commit with Rollback
  const writtenDocIds = new Set<string>()

  // Step A: Commit documents to IndexedDB first
  try {
    for (const item of stagedDocsToAdd) {
      await saveDocument(item.caseId, item.blob, item.metadata.fileName)
      writtenDocIds.add(item.caseId)
    }
  } catch (err) {
    // Rollback Step A
    for (const writtenId of Array.from(writtenDocIds)) {
      try {
        await deleteDocument(writtenId)
      } catch (rollbackErr) {
        console.error(`Rollback error deleting document for ${writtenId}:`, rollbackErr)
      }
    }
    return {
      success: false,
      totalCasesInBackup: validation.casesCount,
      addedCasesCount: 0,
      skippedDuplicatesCount: duplicateCaseIds.length,
      duplicateCaseIds,
      totalDocsInBackup: validation.documentsCount,
      addedDocsCount: 0,
      skippedExistingDocsCount,
      warnings: validation.warnings,
      error: `IndexedDB commit failed during PDF staging: ${err instanceof Error ? err.message : String(err)}. All changes were rolled back.`,
    }
  }

  // Step B: Commit cases to localStorage
  const mergedCases = [...stagedCasesToAdd, ...existingCases]
  const saveSuccess = saveStoredCases(mergedCases)

  if (!saveSuccess) {
    // Rollback Step B: Remove all documents added in Step A
    for (const writtenId of Array.from(writtenDocIds)) {
      try {
        await deleteDocument(writtenId)
      } catch (rollbackErr) {
        console.error(`Rollback error deleting document for ${writtenId}:`, rollbackErr)
      }
    }
    return {
      success: false,
      totalCasesInBackup: validation.casesCount,
      addedCasesCount: 0,
      skippedDuplicatesCount: duplicateCaseIds.length,
      duplicateCaseIds,
      totalDocsInBackup: validation.documentsCount,
      addedDocsCount: 0,
      skippedExistingDocsCount,
      warnings: validation.warnings,
      error: 'Failed to write merged cases to localStorage (quota exceeded or storage restricted). All IndexedDB changes were rolled back.',
    }
  }

  return {
    success: true,
    totalCasesInBackup: validation.casesCount,
    addedCasesCount: stagedCasesToAdd.length,
    skippedDuplicatesCount: duplicateCaseIds.length,
    duplicateCaseIds,
    totalDocsInBackup: validation.documentsCount,
    addedDocsCount: stagedDocsToAdd.length,
    skippedExistingDocsCount,
    warnings: validation.warnings,
  }
}

/**
 * Escapes a single CSV field following RFC 4180 standards.
 */
function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '""'
  const str = String(val)
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return `"${str}"`
}

/**
 * Generates an RFC 4180 compliant CSV string with UTF-8 BOM for Microsoft Excel / Google Sheets compatibility.
 */
export function generateCasesCsv(cases: CaseRecord[]): string {
  const BOM = '\uFEFF'
  const headers = [
    'ID',
    'Title',
    'Citation',
    'Case Number',
    'Court',
    'Jurisdiction',
    'Primary Code',
    'Decision Date',
    'Decided Display',
    'Bench / Coram',
    'Needs Review',
    'Legal Topics',
    'Summary',
    'Full Notes',
    'Source',
    'Attached PDF Name',
    'Attached PDF Size (Bytes)',
  ]

  const rows = cases.map((c) => [
    escapeCsvField(c.id),
    escapeCsvField(c.title),
    escapeCsvField(c.citation || ''),
    escapeCsvField(c.caseNumber || ''),
    escapeCsvField(c.court),
    escapeCsvField(c.jurisdiction),
    escapeCsvField(c.code),
    escapeCsvField(c.decisionDate || ''),
    escapeCsvField(c.decidedDisplay || ''),
    escapeCsvField(c.bench || ''),
    escapeCsvField(c.needsReview ? 'Yes' : 'No'),
    escapeCsvField(c.tags ? c.tags.join('; ') : ''),
    escapeCsvField(c.summary),
    escapeCsvField(c.fullNotes || ''),
    escapeCsvField(c.source || ''),
    escapeCsvField(c.pdfMetadata?.fileName || 'None'),
    escapeCsvField(c.pdfMetadata?.fileSize || 0),
  ])

  const csvContent = [headers.map(escapeCsvField).join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  return BOM + csvContent
}

/**
 * Triggers a browser download of the case records as CSV.
 */
export function downloadCasesCsv(cases: CaseRecord[]): string {
  const csvContent = generateCasesCsv(cases)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `case-law-library-cases-${dateStr}.csv`

  if (typeof window !== 'undefined') {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return csvContent
}
