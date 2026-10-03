import { useEffect, useMemo, useState } from "react"
import { Plus, Trash2, Utensils } from "lucide-react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { MenuStatusBadge } from "~/components/pos/menu/menu-status"
import { normalizeMenuStatus } from "~/utils/menu-status"
import type { MenuModifierAssignment, Modifier, ModifierMenu } from "./modifier-types"

type ComponentProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  modifier: Modifier
  menus: ModifierMenu[]
  assignments: MenuModifierAssignment[]
}

export function ModifierAssignmentsDialog({ open, onOpenChange, modifier, menus, assignments }: ComponentProps) {
  const [selectedMenuId, setSelectedMenuId] = useState("")
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"

  const modifierAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.modifier_id === modifier.id),
    [assignments, modifier.id],
  )
  const assignedMenuIds = new Set(modifierAssignments.map((assignment) => assignment.menu_id))
  const assignableMenus = menus.filter((menu) => !assignedMenuIds.has(menu.id) && normalizeMenuStatus(menu.status) !== "available")

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && fetcher.data.intent === "assign_modifier") {
      setSelectedMenuId("")
    }
  }, [fetcher.data, fetcher.state])

  const selectedMenu = menus.find((menu) => menu.id === selectedMenuId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign {modifier.name}</DialogTitle>
          <DialogDescription>Choose which menus can offer this modifier. Available menus cannot be changed until they are taken offline.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Assigned menus</h3>
            {modifierAssignments.length ? (
              <ul className="divide-y rounded-lg border">
                {modifierAssignments.map((assignment) => {
                  const menu = menus.find((item) => item.id === assignment.menu_id) ?? assignment.menu
                  const menuName = menu?.name ?? "Menu item"
                  const isAvailable = normalizeMenuStatus(menu?.status) === "available"
                  return (
                    <li key={assignment.id} className="flex items-center gap-2 px-3 py-2.5">
                      <Utensils className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{menuName}</span>
                      <MenuStatusBadge status={menu?.status} />
                      <fetcher.Form method="post" action="/pos/modifiers">
                        <input type="hidden" name="intent" value="remove_menu_assignment" />
                        <input type="hidden" name="assignment_id" value={assignment.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove ${modifier.name} from ${menuName}`}
                          title={isAvailable ? "Take the menu offline before changing assignments" : "Remove assignment"}
                          disabled={isSubmitting || isAvailable}
                        >
                          <Trash2 />
                        </Button>
                      </fetcher.Form>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">Not assigned to any menus.</p>
            )}
          </section>

          <fetcher.Form method="post" action="/pos/modifiers" className="space-y-2">
            <input type="hidden" name="intent" value="assign_modifier" />
            <input type="hidden" name="modifier_id" value={modifier.id} />
            <input type="hidden" name="menu_id" value={selectedMenuId} />
            <label htmlFor={`assign-menu-${modifier.id}`} className="text-xs font-semibold">Add to a menu</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={selectedMenuId} onValueChange={(value) => setSelectedMenuId(value ?? "")}>
                <SelectTrigger id={`assign-menu-${modifier.id}`} className="w-full flex-1">
                  <SelectValue>{selectedMenu?.name ?? (assignableMenus.length ? "Select menu" : "No eligible menus")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {assignableMenus.map((menu) => <SelectItem key={menu.id} value={menu.id}>{menu.name}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button type="submit" size="sm" disabled={!selectedMenuId || isSubmitting}>
                <Plus /> {isSubmitting ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </fetcher.Form>

          {!menus.length && <p className="text-xs text-muted-foreground">No menus are available yet.</p>}
        </div>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="ghost" disabled={isSubmitting}>Done</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}