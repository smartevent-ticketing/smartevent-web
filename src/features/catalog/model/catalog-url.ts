export interface CatalogFilters {
  q: string
  city: string
  categoryId: string
}

export function catalogUrl(filters: Partial<CatalogFilters>): string {
  const params = new URLSearchParams()
  if (filters.q?.trim()) params.set("q", filters.q.trim())
  if (filters.city?.trim()) params.set("city", filters.city.trim())
  if (filters.categoryId?.trim()) params.set("categoryId", filters.categoryId.trim())
  const query = params.toString()
  return query ? `/events?${query}` : "/events"
}
