'use client'

import { ChevronDown, X } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'

// Controls use a 2px ink border for high contrast and Swiss structural presence.
export const controlClass =
  'h-12 w-full rounded-none border-2 border-ink bg-ground px-3 text-[15px] font-medium text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors'

export const primaryButtonClass =
  'inline-flex h-12 items-center justify-center gap-2 rounded-none border-2 border-ink bg-ink px-6 text-[13px] font-extrabold uppercase tracking-wider text-ground hover:bg-accent hover:border-accent hover:text-ground active:bg-ink active:border-ink transition-colors disabled:cursor-not-allowed disabled:opacity-50'

export const secondaryButtonClass =
  'inline-flex h-12 items-center justify-center gap-2 rounded-none border-2 border-ink bg-ground px-6 text-[13px] font-extrabold uppercase tracking-wider text-ink hover:bg-ink hover:text-ground active:bg-surface transition-colors'

// Row and toolbar actions share one size: 44px tall on touch layouts, 40px in the table.
export const actionPrimaryClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-none border-2 border-ink bg-ink px-4 text-[13px] font-extrabold tracking-wide text-ground hover:bg-accent hover:border-accent hover:text-ground transition-colors lg:h-10'

export const actionSecondaryClass =
  'inline-flex h-11 items-center justify-center gap-2 rounded-none border-2 border-ink bg-ground px-4 text-[13px] font-extrabold tracking-wide text-ink hover:bg-ink hover:text-ground transition-colors lg:h-10'

// One topic-tag style for the results table and the record page.
export const tagClass =
  'inline-block max-w-full truncate border border-ink/20 bg-surface px-2.5 py-1 text-[12px] font-medium tracking-wide text-ink hover:border-ink'

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
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="label-caps text-ink">
        {label}
        {required && (
          <span aria-hidden="true"> *</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[14px] text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="border-l-4 border-ink pl-3 text-[14px] font-bold text-ink"
        >
          {error}
        </p>
      )}
    </div>
  )
}

type SelectFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  className?: string
  compact?: boolean
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  className,
  compact,
}: SelectFieldProps) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className ?? ''}`}>
      <label htmlFor={id} className="label-caps text-ink">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${controlClass} cursor-pointer appearance-none truncate pr-10 ${compact ? 'h-11 text-[14px] lg:h-10' : ''}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2.5}
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink"
        />
      </div>
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
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-ink/70" />
        <Dialog.Popup
          className={`fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] ${modalWidth[size]} -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-none border-2 border-ink bg-ground`}
        >
          <div className="flex items-start justify-between gap-6 border-b-2 border-ink p-5 md:p-6">
            <div className="min-w-0">
              <Dialog.Title className="text-[28px] font-bold leading-[1.1] tracking-[-0.02em] text-ink">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-3 text-[15px] leading-[1.5] text-ink-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close dialog"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-none border-2 border-ink bg-ground text-ink hover:bg-ink hover:text-ground"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          <div className="p-5 md:p-6">{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
