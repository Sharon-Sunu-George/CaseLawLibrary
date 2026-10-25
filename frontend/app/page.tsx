import { Suspense } from 'react'
import { LibraryView } from '@/components/case-library/library-view'
import { LoadingState } from '@/components/case-library/result-states'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1440px] px-4 py-16 xs:px-5 md:px-7 xl:px-10">
          <LoadingState />
        </div>
      }
    >
      <LibraryView />
    </Suspense>
  )
}
