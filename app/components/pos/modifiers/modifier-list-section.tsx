import { useEffect, useState } from "react"
import { CookingPot, Link2, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "~/components/ui/empty"
import { ModifierAssignmentsDialog } from "./modifier-assignments-dialog"
import { ModifierEditorDialog } from "./modifier-editor-dialog"
import type { IngredientOption, MenuModifierAssignment, Modifier, ModifierCategory, ModifierMenu, ModifierRecipe } from "./modifier-types"

type ComponentProps = {
  modifiers: Modifier[]
  categories: ModifierCategory[]
  recipes: ModifierRecipe[]
  ingredients: IngredientOption[]
  menus: ModifierMenu[]
  assignments: MenuModifierAssignment[]
  onCreate: () => void
  hasFilters: boolean
  onClearFilters: () => void
}

const formatPrice = (price: number | string | null | undefined, unavailableLabel = "Cost unavailable") => {
  if (price == null || price === "") return unavailableLabel

  const amount = Number(price)
  if (!Number.isFinite(amount)) return unavailableLabel

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)
}

function ModifierCard({ modifier, categories, recipes, ingredients, menus, assignments }: Omit<ComponentProps, "modifiers" | "onCreate" | "hasFilters" | "onClearFilters"> & { modifier: Modifier }) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const fetcher = useFetcher()
  const isDeleting = fetcher.state !== "idle"
  const categoryName = modifier.category ?? categories.find((category) => category.id === modifier.category_id)?.category ?? "Uncategorized"
  const sourceType = modifier.ingredient_id ? "Ingredient" : modifier.source_recipe_id ? "Recipe" : "Source"
  const sourceName = modifier.ingredient?.item_name ?? modifier.ingredient?.name ?? modifier.source_recipe?.recipe_name ?? modifier.source_recipe?.name ?? "Selected source"
  const sourceRecipe = modifier.source_recipe ?? recipes.find(
    (recipe) => String(recipe.id ?? recipe.recipe_id ?? "") === String(modifier.source_recipe_id ?? ""),
  )
  const isAddonRecipe = Boolean(modifier.source_recipe_id) && sourceRecipe?.category?.toLowerCase() === "addon"
  const displayPrice = isAddonRecipe ? sourceRecipe?.selling_price : modifier.cost
  const displayPriceLabel = isAddonRecipe ? "Selling price" : sourceType === "Recipe" ? "Recipe cost" : "Ingredient cost"
  const unavailableLabel = isAddonRecipe ? "Price unavailable" : "Cost unavailable"
  const assignmentCount = assignments.filter((assignment) => assignment.modifier_id === modifier.id).length

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && fetcher.data.intent === "delete_modifier") {
      setIsDeleteOpen(false)
    }
  }, [fetcher.data, fetcher.state])

  return (
    <article className="flex min-h-[220px] flex-col rounded-xl border bg-background p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex max-w-full truncate rounded-full border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{categoryName}</span>
          <h3 className="mt-2 truncate text-base font-semibold" title={modifier.name}>{modifier.name}</h3>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1 text-right dark:border-emerald-900/60 dark:bg-emerald-950/40">
          <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">{displayPriceLabel}</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-emerald-700 dark:text-emerald-200">{formatPrice(displayPrice, unavailableLabel)}</p>
        </div>
      </div>

      <div className="mt-3 flex-1 space-y-2">
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground"><CookingPot className="size-3.5 shrink-0" />{sourceType} source</p>
        <div className="rounded-lg border bg-muted/30 px-2.5 py-2">
          <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">{sourceType} source</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium" title={sourceName}>{sourceName}</span>
            {!isAddonRecipe && <span className="text-xs text-muted-foreground">{formatPrice(modifier.cost)}</span>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <Button type="button" variant="outline" size="sm" onClick={() => setIsAssignmentsOpen(true)}>
          <Link2 /> Menus <span className="tabular-nums">{assignmentCount}</span>
        </Button>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${modifier.name}`} title="Edit modifier" onClick={() => setIsEditOpen(true)}><Pencil /></Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${modifier.name}`} title="Delete modifier" onClick={() => setIsDeleteOpen(true)}><Trash2 /></Button>
        </div>
      </div>

      <ModifierEditorDialog open={isEditOpen} onOpenChange={setIsEditOpen} categories={categories} recipes={recipes} ingredients={ingredients} modifier={modifier} />
      <ModifierAssignmentsDialog open={isAssignmentsOpen} onOpenChange={setIsAssignmentsOpen} modifier={modifier} menus={menus} assignments={assignments} />
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete modifier?</DialogTitle>
            <DialogDescription>Delete “{modifier.name}”? Remove any menu assignments before deleting the modifier.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" disabled={isDeleting}>Cancel</Button>} />
            <fetcher.Form method="post" action="/pos/modifiers">
              <input type="hidden" name="intent" value="delete_modifier" />
              <input type="hidden" name="modifier_id" value={modifier.id} />
              <Button type="submit" variant="destructive" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete modifier"}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  )
}

export function ModifierListSection({ modifiers, categories, recipes, ingredients, menus, assignments, onCreate, hasFilters, onClearFilters }: ComponentProps) {
  if (!modifiers.length) {
    return (
      <Empty className="min-h-64 border-0 py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon"><MoreHorizontal /></EmptyMedia>
          <EmptyTitle>{hasFilters ? "No modifiers match" : "No modifiers yet"}</EmptyTitle>
          <EmptyDescription>
            {hasFilters ? "Try another key phrase or category." : categories.length ? "Create your first modifier and connect it to an ingredient or recipe source." : "Add a modifier category before creating modifiers."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {hasFilters ? <Button type="button" variant="outline" onClick={onClearFilters}>Clear filters</Button> : categories.length > 0 ? <Button type="button" onClick={onCreate}>Create modifier</Button> : null}
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <section aria-label="Modifier library" className="min-w-0">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Modifier library</h2>
          <p className="mt-1 text-xs text-muted-foreground">{modifiers.length} {modifiers.length === 1 ? "option" : "options"}</p>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {modifiers.map((modifier) => (
          <ModifierCard
            key={modifier.id}
            modifier={modifier}
            categories={categories}
            recipes={recipes}
            ingredients={ingredients}
            menus={menus}
            assignments={assignments}
          />
        ))}
      </div>
    </section>
  )
}
