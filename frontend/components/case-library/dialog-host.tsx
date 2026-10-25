'use client'

import { AskDialog } from './ask-dialog'
import { BulkAddDialog } from './bulk-add-dialog'
import { CaseFormDialog } from './case-form-dialog'
import { useLibrary } from './library-provider'

export function DialogHost() {
  const { dialog, closeDialog } = useLibrary()

  return (
    <>
      <AskDialog open={dialog?.kind === 'ask'} onClose={closeDialog} />
      <BulkAddDialog open={dialog?.kind === 'bulk'} onClose={closeDialog} />
      <CaseFormDialog
        open={dialog?.kind === 'form'}
        caseId={dialog?.kind === 'form' ? dialog.caseId : undefined}
        onClose={closeDialog}
      />
    </>
  )
}
