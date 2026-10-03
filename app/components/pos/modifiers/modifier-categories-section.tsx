import { useEffect, useState } from "react"
import { Check, Pencil, Plus, Trash2, X } from "lucide-react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import type { Modifier, ModifierCategory } from "./modifier-types"

type ComponentProps = {
  categories: ModifierCategory[]
  modifiers: Modifier[]
}

export function ModifierCategoriesSection({ categories, modifiers }: ComponentProps) {
  const [newCategory, setNewCategory] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingName, setEditingName] = useState("")
  const [deletingCategory, setDeletingCategory] = useState<ModifierCategory | null>(null)
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data?.success) return
    if (fetcher.data.intent === "create_modifier_category") setNewCategory("")
    if (fetcher.data.intent === "update_modifier_category") {
      setEditingId(null)
      setEditingName("")
    }
    if (fetcher.data.intent === "delete_modifier_category") setDeletingCategory(null)
  }, [fetcher.data, fetcher.state])

  const submitNewCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const category = newCategory.trim()
    if (category.length < 2) return
    fetcher.submit({ intent: "create_modifier_category", category }, { method: "post", action: "/pos/modifiers" })
  }

  const submitCategoryUpdate = (categoryId: number) => {
    const category = editingName.trim()
    if (category.length < 2) return
    fetcher.submit({ intent: "update_modifier_category", category_id: String(categoryId), category }, { method: "post", action: "/pos/modifiers" })
  }

  return (
    <section className="h-fit overflow-hidden rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Modifier categories</h2>
            <p className="mt-1 text-xs text-muted-foreground">Keep options organized for your team.</p>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{categories.length}</span>
        </div>
      </header>
      <div className="p-3">
        <form onSubmit={submitNewCategory} className="flex gap-2">
          <Input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="New category"
            aria-label="New modifier category"
            maxLength={80}
            disabled={isSubmitting}
          />
          <Button type="submit" size="icon" aria-label="Add category" title="Add category" disabled={newCategory.trim().length < 2 || isSubmitting}>
            <Plus />
          </Button>
        </form>

        {categories.length ? (
          <ul className="mt-3 divide-y rounded-lg border">
            {categories.map((category) => {
              const isEditing = editingId === category.id
              const modifierCount = modifiers.filter((modifier) => modifier.category_id === category.id).length

              return (
                <li key={category.id} className="flex items-center gap-2 px-2.5 py-2">
                  {isEditing ? (
                    <>
                      <Input value={editingName} onChange={(event) => setEditingName(event.target.value)} aria-label={`Rename ${category.category}`} maxLength={80} autoFocus />
                      <Button type="button" size="icon-sm" aria-label="Save category name" title="Save" disabled={editingName.trim().length < 2 || isSubmitting} onClick={() => submitCategoryUpdate(category.id)}><Check /></Button>
                      <Button type="button" size="icon-sm" variant="ghost" aria-label="Cancel rename" title="Cancel" onClick={() => { setEditingId(null); setEditingName("") }}><X /></Button>
                    </>
                  ) : (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{category.category}</p>
                        <p className="text-[11px] text-muted-foreground">{modifierCount} {modifierCount === 1 ? "modifier" : "modifiers"}</p>
                      </div>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Rename ${category.category}`} title="Rename category" disabled={isSubmitting} onClick={() => { setEditingId(category.id); setEditingName(category.category) }}><Pencil /></Button>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${category.category}`} title="Delete category" disabled={isSubmitting} onClick={() => setDeletingCategory(category)}><Trash2 /></Button>
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-2 py-5 text-center text-xs text-muted-foreground">No modifier categories yet.</p>
        )}
      </div>

      <Dialog open={Boolean(deletingCategory)} onOpenChange={(open) => { if (!open) setDeletingCategory(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>Delete “{deletingCategory?.category}”? Categories in use cannot be removed.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>} />
            <fetcher.Form method="post" action="/pos/modifiers">
              <input type="hidden" name="intent" value="delete_modifier_category" />
              <input type="hidden" name="category_id" value={deletingCategory?.id ?? ""} />
              <Button type="submit" variant="destructive" disabled={!deletingCategory || isSubmitting}>
                {isSubmitting ? "Deleting..." : "Delete category"}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}