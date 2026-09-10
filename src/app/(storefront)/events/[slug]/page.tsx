import { EventDetailView } from "@/features/catalog"

interface EventDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params

  return <EventDetailView eventId={slug} />
}
