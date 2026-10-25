export function PageIntroduction() {
  return (
    <section aria-labelledby="page-title" className="border-b-2 border-ink">
      <div className="frame grid swiss-cols gap-y-4 pb-6 pt-6 md:pb-7 md:pt-7">
        <div className="md:col-span-3 md:pt-2">
          <p className="label-caps flex items-center gap-2 text-ink">
            <span className="size-2 bg-accent" aria-hidden="true" />
            <span className="font-black text-ink">01</span>
            <span className="text-ink-subtle">Library Overview</span>
          </p>
        </div>

        <div className="min-w-0 md:col-span-9">
          <h1
            id="page-title"
            className="text-[clamp(2.5rem,6vw,5.5rem)] font-[850] leading-[0.92] tracking-[-0.04em] text-ink"
          >
            Case Law Library
          </h1>

          <div className="mt-4 grid gap-y-3 border-t-2 border-ink pt-4 md:grid-cols-9 md:gap-x-[var(--dp-spacing-gutter)]">
            <p className="max-w-[42ch] text-[16px] font-medium leading-[1.4] text-ink-muted md:col-span-9 xl:col-span-6">
              Search, review, and explore indexed legal judgments, citations, and statutory codes.
            </p>
            <div className="border border-accent bg-accent-subtle p-3 md:col-span-9 xl:col-span-3">
              <span className="label-caps mb-1 flex items-center gap-1.5 font-black text-accent">
                <span className="size-1.5 bg-accent" aria-hidden="true" />
                Sample data notice
              </span>
              <p className="text-[12px] font-medium leading-[1.4] text-ink-muted">
                Sample records for design review. None are verified judgments or formal legal advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
