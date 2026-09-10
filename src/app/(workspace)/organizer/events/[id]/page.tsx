import { EventManagementView } from "@/features/organizer"

interface OrganizerEventDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrganizerEventDetailPage({ params }: OrganizerEventDetailPageProps) {
  const { id } = await params

  return <EventManagementView eventId={id} />
}
