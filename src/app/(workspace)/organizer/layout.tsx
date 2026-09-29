import { OrganizerWorkspace } from "@/features/organizer/organizer-workspace"

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return <OrganizerWorkspace>{children}</OrganizerWorkspace>
}
