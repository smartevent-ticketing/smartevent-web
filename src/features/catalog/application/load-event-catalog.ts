import { catalogApi } from "../api/catalog-api"
import { ApiRequestError } from "@/lib/api/result"

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function loadEventCatalog(identifier: string, signal: AbortSignal) {
  const response = await (uuid.test(identifier)
    ? catalogApi.getEvent({ params: { path: { id: identifier } }, signal })
    : catalogApi.getEventBySlug({ params: { path: { slug: identifier } }, signal }))
  const event = response.data?.data
  if (!event?.id) throw new ApiRequestError("Không tìm thấy sự kiện.", 404)
  const options = { params: { path: { eventId: event.id } }, signal }
  const [areas, types, phases, inventory] = await Promise.all([
    catalogApi.getAreas(options),
    catalogApi.getTicketTypes(options),
    catalogApi.getSalePhases(options),
    catalogApi.getInventory(options),
  ])
  let bannerUrl = "/images/concert-banner.jpg"
  const banner = event.files?.find((file) => file.fileType === "BANNER")
  if (banner?.fileId) {
    try {
      bannerUrl =
        (await catalogApi.getMediaUrl({ params: { path: { fileId: banner.fileId } }, signal })).data
          ?.data?.url ?? bannerUrl
    } catch (error) {
      if (signal.aborted) throw error
    }
  }
  return {
    event,
    areas: areas.data?.data ?? [],
    types: types.data?.data ?? [],
    phases: phases.data?.data ?? [],
    inventory: inventory.data?.data ?? [],
    bannerUrl,
  }
}
