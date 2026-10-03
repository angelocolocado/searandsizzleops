import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

export type MenuModifier = {
  id?: string | number
  modifier_id?: string | number
  name?: string
  modifier_name?: string
  price?: string | number
}

type ComponentProps = {
  menuId: string
  availableModifiers: MenuModifier[]
  assignedModifiers: MenuModifier[]
}

const getModifierId = (modifier: MenuModifier) => modifier.modifier_id ?? modifier.id
const getModifierName = (modifier: MenuModifier) => modifier.modifier_name ?? modifier.name ?? "Modifier"

export function MenuModifiersSection({ menuId, availableModifiers, assignedModifiers }: ComponentProps) {
  const [selectedId, setSelectedId] = useState("")
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"
  const assignedIds = new Set(assignedModifiers.map((modifier) => String(getModifierId(modifier))))
  const unassignedModifiers = availableModifiers.filter((modifier) => {
    const id = getModifierId(modifier)
    return id !== undefined && !assignedIds.has(String(id))
  })

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Modifiers</h2>
        <p className="mt-1 text-xs text-muted-foreground">Choose optional add-ons or customizations available for this menu item.</p>
      </header>
      <div className="space-y-4 p-4">
        {assignedModifiers.length ? (
          <ul className="divide-y rounded-lg border">
            {assignedModifiers.map((modifier, index) => {
              const id = getModifierId(modifier)
              return (
                <li key={String(id ?? index)} className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{getModifierName(modifier)}</p>
                    {modifier.price !== undefined && <p className="text-xs text-muted-foreground">₱{modifier.price}</p>}
                  </div>
                  <fetcher.Form method="post" action={`/pos/menu/${menuId}`}>
                    <input type="hidden" name="intent" value="remove_modifier" />
                    <input type="hidden" name="modifier_id" value={String(id ?? "")} />
                    <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Remove ${getModifierName(modifier)}`} disabled={isSubmitting || id === undefined}>
                      <Trash2 />
                    </Button>
                  </fetcher.Form>
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
              if (!selectedId) event.preventDefault()
            }}
          >
            <input type="hidden" name="intent" value="add_modifier" />
            <input type="hidden" name="modifier_id" value={selectedId} />
            <Select value={selectedId} onValueChange={(value) => setSelectedId(value ?? "")}>
              <SelectTrigger className="w-full flex-1">
                <SelectValue placeholder={unassignedModifiers.length ? "Select a modifier" : "All modifiers added"} />
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
            <Button type="submit" size="sm" disabled={!selectedId || isSubmitting}>
              <Plus /> {isSubmitting ? "Saving..." : "Add modifier"}
            </Button>
          </fetcher.Form>
        ) : (
          <p className="text-xs text-muted-foreground">No modifiers are available yet. Add modifiers in the modifier manager first.</p>
        )}
      </div>
    </section>
  )
}