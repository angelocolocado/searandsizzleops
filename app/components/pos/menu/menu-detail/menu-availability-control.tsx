import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { getMenuStatusLabel, getMenuStatusValue, MENU_STATUS_OPTIONS, type MenuStatus } from "~/utils/menu-status"

type ComponentProps = {
  menuId: string
  status: MenuStatus
}

export function MenuAvailabilityControl({ menuId, status }: ComponentProps) {
  const currentValue = getMenuStatusValue(status)
  const [selectedStatus, setSelectedStatus] = useState(currentValue)
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"

  useEffect(() => {
    setSelectedStatus(currentValue)
  }, [currentValue])

  return (
    <fetcher.Form
      method="post"
      action={`/pos/menu/${menuId}`}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
      onSubmit={(event) => {
        if (!selectedStatus || selectedStatus === currentValue) event.preventDefault()
      }}
    >
      <input type="hidden" name="intent" value="update_status" />
      <input type="hidden" name="status" value={selectedStatus} />
      <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value ?? "")}>
        <SelectTrigger className="h-8 w-full sm:w-[205px]" aria-label="Menu availability">
          <SelectValue>{getMenuStatusLabel(selectedStatus) || "Choose availability"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {MENU_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button type="submit" size="sm" variant="outline" disabled={!selectedStatus || selectedStatus === currentValue || isSubmitting}>
        <Check /> {isSubmitting ? "Saving..." : "Update status"}
      </Button>
    </fetcher.Form>
  )
}