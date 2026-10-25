import { RefreshCw } from 'lucide-react'
import { primaryButtonClass, secondaryButtonClass } from './ui'

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="grid swiss-cols border-b-2 border-ink py-12 md:py-16">
      <div className="md:col-span-9 md:col-start-4">
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-[750] leading-[1] tracking-[-0.035em] text-ink">
          No cases found
        </h2>
        <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.5] text-ink-muted">
          Nothing in the sample library matches the current search and filters.
          Try fewer keywords, a different court or code, or start again.
        </p>
        <button type="button" onClick={onReset} className={`${secondaryButtonClass} mt-6`}>
          Reset search and filters
        </button>
      </div>
    </div>
  )
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="grid swiss-cols border-b-2 border-ink py-12 md:py-16">
      <div className="md:col-span-9 md:col-start-4">
        <h2 className="text-[clamp(2rem,4vw,3.5rem)] font-[750] leading-[1] tracking-[-0.035em] text-ink">
          We couldn&apos;t load the results
        </h2>
        <p className="mt-4 max-w-[56ch] text-[16px] leading-[1.5] text-ink-muted">
          The search did not complete. Your search terms and filters have been
          kept, so you can try again.
        </p>
        <button type="button" onClick={onRetry} className={`${primaryButtonClass} mt-6`}>
          <RefreshCw className="size-4" strokeWidth={2.5} aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  )
}

export function LoadingState() {
  return (
    <div aria-hidden="true" className="divide-y-2 divide-rule-soft border-b-2 border-ink">
      {[0, 1, 2].map((row) => (
        <div key={row} className="grid swiss-cols gap-y-3 py-6">
          <div className="h-4 w-1/2 bg-surface md:col-span-3" />
          <div className="space-y-3 md:col-span-9">
            <div className="h-6 w-3/4 bg-surface" />
            <div className="h-4 w-1/3 bg-surface" />
            <div className="h-4 w-full bg-surface" />
            <div className="h-4 w-2/3 bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}
