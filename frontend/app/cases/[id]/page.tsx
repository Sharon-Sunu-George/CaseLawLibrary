import { CaseDetailView } from '@/components/case-library/case-detail-view'

export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <CaseDetailView id={id} />
}
