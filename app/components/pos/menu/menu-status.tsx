import { normalizeMenuStatus, type MenuStatus } from "~/utils/menu-status"

export function MenuStatusBadge({ status }: { status: MenuStatus }) {
  const normalized = normalizeMenuStatus(status)
  const label = normalized === "available"
    ? "Available"
    : normalized === "unavailable"
      ? "Unavailable"
      : normalized === "temporary-unavailable"
        ? "Temporarily unavailable"
        : "Status unknown"
  const styles = normalized === "available"
    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    : normalized === "unavailable"
      ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300"
      : normalized === "temporary-unavailable"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-800 dark:text-amber-300"
        : "border-border bg-muted text-muted-foreground"

  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}>
      {label}
    </span>
  )
}