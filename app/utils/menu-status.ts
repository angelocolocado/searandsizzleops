export type MenuStatus = string | number | null | undefined

export type MenuStatusValue = "1" | "2" | "3"

export type NormalizedMenuStatus = "available" | "unavailable" | "temporary-unavailable" | "unknown"

export const MENU_STATUS_OPTIONS: { value: MenuStatusValue; label: string }[] = [
  { value: "1", label: "Available" },
  { value: "2", label: "Unavailable" },
  { value: "3", label: "Temporarily unavailable" },
]

export const normalizeMenuStatus = (status: MenuStatus): NormalizedMenuStatus => {
  const value = String(status ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-")

  if (value === "1" || value === "available") return "available"
  if (value === "2" || value === "unavailable") return "unavailable"
  if (["3", "temporary-unavailable", "temporarily-unavailable"].includes(value)) return "temporary-unavailable"

  return "unknown"
}

export const getMenuStatusValue = (status: MenuStatus): MenuStatusValue | "" => {
  const normalized = normalizeMenuStatus(status)
  if (normalized === "available") return "1"
  if (normalized === "unavailable") return "2"
  if (normalized === "temporary-unavailable") return "3"
  return ""
}

export const getMenuStatusLabel = (status: MenuStatus): string => {
  const value = getMenuStatusValue(status)
  return MENU_STATUS_OPTIONS.find((option) => option.value === value)?.label ?? ""
}