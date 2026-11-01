'use client'

import { ChevronDown, X } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'

export const controlClass =
  'h-10 w-full rounded-none border border-black bg-white px-3 text-xs text-black placeholder:text-neutral-400 focus:outline-none'

export const primaryButtonClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-none bg-[#D91C1F] hover:bg-[#b51518] px-6 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer'

export const secondaryButtonClass =
  'inline-flex h-10 items-center justify-center gap-2 rounded-none border border-black bg-white px-5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-black hover:bg-neutral-100 transition-colors cursor-pointer'

type FieldProps = {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

export function Field({ id, label, hint, error, required, children }: FieldProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor={id} className="block text-[10.5px] font-extrabold tracking-[0.12em] uppercase text-black">
        {label}
        {required && <span className="text-[#D91C1F]" aria-hidden="true"> *</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="border-l-2 border-[#D91C1F] pl-2 text-xs font-bold text-[#D91C1F]"
        >
          {error}
        </p>
      )}
    </div>
  )
}

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const modalWidth = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-2xl' }

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
}: ModalProps) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Popup
          className={`fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] ${modalWidth[size]} -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-none border-2 border-black bg-white shadow-2xl`}
        >
          {/* Swiss Modernist Header */}
          <div className="bg-[#0A0A0A] text-white px-6 py-4 flex items-center justify-between border-b border-black">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 bg-[#D91C1F] inline-block shrink-0" />
              <Dialog.Title className="text-[11px] font-extrabold tracking-[0.14em] uppercase truncate text-white">
                {title}
              </Dialog.Title>
            </div>
            <Dialog.Close
              aria-label="Close dialog"
              className="text-xs font-extrabold uppercase tracking-widest text-neutral-300 hover:text-white cursor-pointer ml-3 shrink-0"
            >
              CLOSE ✕
            </Dialog.Close>
          </div>
          {description && (
            <div className="px-6 pt-4 text-xs text-neutral-600 leading-relaxed border-b border-neutral-200 pb-3">
              <Dialog.Description>{description}</Dialog.Description>
            </div>
          )}
          <div className="p-6 sm:p-8">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
