import { Suspense } from 'react'
import { LibraryView } from '@/components/case-library/library-view'
import { LoadingState } from '@/components/case-library/result-states'

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="frame py-16">
          <LoadingState />
        </div>
      }
    >
      <LibraryView />
    </Suspense>
  )
}
