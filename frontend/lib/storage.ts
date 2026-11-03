import type { CaseRecord } from './case-types'
import { SAMPLE_CASES } from './cases-data'

export const STORAGE_KEY = 'caselaw_library_records_v1'

/**
 * Validates whether an unknown value conforms to the minimum CaseRecord structure.
 */
export function isValidCaseRecord(item: unknown): item is CaseRecord {
  if (!item || typeof item !== 'object') return false
  const candidate = item as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.title === 'string' &&
    typeof candidate.court === 'string' &&
    typeof candidate.jurisdiction === 'string' &&
    typeof candidate.code === 'string' &&
    typeof candidate.summary === 'string' &&
    Array.isArray(candidate.tags) &&
    typeof candidate.needsReview === 'boolean'
  )
}

/**
 * Loads case records from localStorage.
 * If no saved data exists, returns null.
 * If data is corrupted or invalid, cleans/safely recovers or returns null.
 */
export function loadStoredCases(): CaseRecord[] | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      console.warn('Storage format mismatch: expected array of case records.')
      return null
    }

    const validRecords = parsed.filter(isValidCaseRecord)
    if (validRecords.length === 0 && parsed.length > 0) {
      console.warn('All records in storage were invalid or corrupted.')
      return null
    }

    return validRecords
  } catch (err) {
    console.error('Failed to read case records from localStorage:', err)
    return null
  }
}

/**
 * Persists case records to localStorage.
 * Handles quota or private browsing exceptions safely.
 */
export function saveStoredCases(cases: CaseRecord[]): boolean {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cases))
    return true
  } catch (err) {
    console.error('Failed to save case records to localStorage:', err)
    return false
  }
}

/**
 * Clears stored case records from localStorage and restores original sample cases.
 */
export function clearStoredCases(): boolean {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (err) {
    console.error('Failed to clear case records from localStorage:', err)
    return false
  }
}

