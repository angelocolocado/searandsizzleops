import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { normalizeMenuStatus, type MenuStatus } from "~/utils/menu-status"

export type MenuModifier = {
  id?: string | number
  modifier_id?: string | number
  name?: string
  modifier_name?: string
  price?: string | number
}

export type MenuModifierAssignment = {
  id: string
  menu_id: string
  modifier_id: string
  modifier?: MenuModifier
}

type ComponentProps = {
  menuId: string
  menuStatus: MenuStatus
  availableModifiers: MenuModifier[]
  assignedModifiers: MenuModifier[]
  assignments: MenuModifierAssignment[]
}

const getModifierId = (modifier: MenuModifier) => modifier.modifier_id ?? modifier.id
const getModifierName = (modifier: MenuModifier) => modifier.modifier_name ?? modifier.name ?? "Modifier"

export function MenuModifiersSection({ menuId, menuStatus, availableModifiers, assignedModifiers, assignments }: ComponentProps) {
  const [selectedId, setSelectedId] = useState("")
  const [pendingRemoval, setPendingRemoval] = useState<MenuModifierAssignment | null>(null)
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"
  const isMenuAvailable = normalizeMenuStatus(menuStatus) === "available"
  const menuAssignments = assignments.filter((assignment) => assignment.menu_id === menuId)
  const assignedIds = new Set([
    ...assignedModifiers.map((modifier) => String(getModifierId(modifier))),
    ...menuAssignments.map((assignment) => String(assignment.modifier_id)),
  ])
  const unassignedModifiers = availableModifiers.filter((modifier) => {
    const id = getModifierId(modifier)
    return id !== undefined && !assignedIds.has(String(id))
  })
  const visibleModifiers = assignedModifiers.length
    ? assignedModifiers
    : menuAssignments.map((assignment) => assignment.modifier ?? availableModifiers.find((modifier) => getModifierId(modifier) === assignment.modifier_id)).filter((modifier): modifier is MenuModifier => Boolean(modifier))

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.success) return
    if (fetcher.data.intent === "add_modifier") setSelectedId("")
    if (fetcher.data.intent === "remove_modifier") setPendingRemoval(null)
  }, [fetcher.data, fetcher.state])

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Modifiers</h2>
        <p className="mt-1 text-xs text-muted-foreground">Choose optional add-ons or customizations available for this menu item.</p>
      </header>
      <div className="space-y-4 p-4">
        {visibleModifiers.length ? (
          <ul className="divide-y rounded-lg border">
            {visibleModifiers.map((modifier, index) => {
              const id = getModifierId(modifier)
              const assignment = menuAssignments.find((item) => item.modifier_id === String(id))
              return (
                <li key={String(id ?? index)} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{getModifierName(modifier)}</p>
                    {modifier.price !== undefined && <p className="text-xs text-muted-foreground">₱{modifier.price}</p>}
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${getModifierName(modifier)}`} title="Remove modifier" disabled={isSubmitting || !assignment} onClick={() => setPendingRemoval(assignment ?? null)}>
                      <Trash2 />
                  </Button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">No modifiers are assigned.</p>
        )}

        {availableModifiers.length ? (
          <fetcher.Form
            method="post"
            action={`/pos/menu/${menuId}`}
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              if (!selectedId || isMenuAvailable) event.preventDefault()
            }}
          >
            <input type="hidden" name="intent" value="add_modifier" />
            <input type="hidden" name="modifier_id" value={selectedId} />
            <Select value={selectedId} onValueChange={(value) => setSelectedId(value ?? "")}>
              <SelectTrigger className="w-full flex-1" disabled={!unassignedModifiers.length || isMenuAvailable}>
                <SelectValue>{availableModifiers.find((modifier) => String(getModifierId(modifier)) === selectedId)?.name ?? (unassignedModifiers.length ? "Select a modifier" : "All modifiers added")}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {unassignedModifiers.map((modifier, index) => {
                    const id = getModifierId(modifier)
                    return id === undefined ? null : <SelectItem key={String(id ?? index)} value={String(id)}>{getModifierName(modifier)}</SelectItem>
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button type="submit" size="sm" disabled={!selectedId || isSubmitting || isMenuAvailable}>
              <Plus /> {isSubmitting ? "Saving..." : "Add modifier"}
            </Button>
          </fetcher.Form>
        ) : (
          <p className="text-xs text-muted-foreground">No modifiers are available yet. Add modifiers in the modifier manager first.</p>
        )}
        {isMenuAvailable && <p className="text-xs text-amber-700">Take this menu offline before changing its modifier assignments.</p>}
      </div>

      <Dialog open={Boolean(pendingRemoval)} onOpenChange={(open) => { if (!open) setPendingRemoval(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove modifier?</DialogTitle>
            <DialogDescription>Remove {pendingRemoval?.modifier?.name ?? availableModifiers.find((modifier) => modifier.id === pendingRemoval?.modifier_id)?.name ?? "this modifier"} from this menu?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>} />
            <fetcher.Form method="post" action={`/pos/menu/${menuId}`}>
              <input type="hidden" name="intent" value="remove_modifier" />
              <input type="hidden" name="assignment_id" value={pendingRemoval?.id ?? ""} />
              <Button type="submit" variant="destructive" disabled={!pendingRemoval || isSubmitting || isMenuAvailable}>
                {isSubmitting ? "Removing..." : "Remove modifier"}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}