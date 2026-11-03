export type DocumentMetadata = {
  documentId?: string
  fileName: string
  fileSize: number // bytes
  uploadedAt: string // ISO date
  mimeType: string
}

export type CaseRecord = {
  id: string
  title: string
  citation?: string
  caseNumber?: string
  court: string
  jurisdiction: string
  code: string
  /** ISO date, YYYY-MM-DD */
  decisionDate?: string
  decidedDisplay?: string
  bench?: string
  fullNotes?: string
  summary: string
  tags: string[]
  needsReview: boolean
  /** Name of the publication the reference screenshot attributed the record to */
  source?: string
  /** Optional document metadata (binary is stored separately in IndexedDB) */
  pdfMetadata?: DocumentMetadata
}

export type SortKey = 'date-desc' | 'date-asc' | 'title-asc' | 'court-asc'

export type CaseFilters = {
  query: string
  court: string
  code: string
  reviewOnly: boolean
  sort: SortKey
}

export type BackupDocumentItem = {
  caseId: string
  documentId?: string
  metadata: DocumentMetadata
  base64Data: string
}

export type LibraryBackupPackage = {
  version: 1
  generator: string
  timestamp: string
  casesCount: number
  documentsCount: number
  cases: CaseRecord[]
  documents: BackupDocumentItem[]
}
