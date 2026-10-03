import { useState } from "react"
import { Plus, Search, SlidersHorizontal, Tags, Utensils } from "lucide-react"
import { Button } from "~/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { ModifierCategoriesSection } from "./modifier-categories-section"
import { ModifierEditorDialog } from "./modifier-editor-dialog"
import { ModifierListSection } from "./modifier-list-section"
import type { MenuModifierAssignment, Modifier, ModifierCategory, ModifierMenu, ModifierRecipe } from "./modifier-types"

type ComponentProps = {
  categories: ModifierCategory[]
  modifiers: Modifier[]
  recipes: ModifierRecipe[]
  menus: ModifierMenu[]
  assignments: MenuModifierAssignment[]
}

export function ModifierWorkspace({ categories, modifiers, recipes, menus, assignments }: ComponentProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const query = search.trim().toLowerCase()

  const filteredModifiers = modifiers.filter((modifier) => {
    const category = modifier.category ?? categories.find((item) => item.id === modifier.category_id)?.category ?? "Uncategorized"
    const recipe = modifier.recipe?.recipe_name ?? modifier.recipe?.name ?? "Standalone"
    const matchesText = [modifier.name, category, recipe, modifier.description ?? ""]
      .some((value) => value.toLowerCase().includes(query))
    const matchesCategory = categoryFilter === "all" || String(modifier.category_id) === categoryFilter
    return matchesText && matchesCategory
  })

  return (
    <main className="animate-in fade-in duration-500 space-y-5 px-5 py-5">
      <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
            <SlidersHorizontal className="size-3.5" /> Point of sale setup
          </p>
          <h1 className="text-2xl font-semibold">Modifiers</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Manage add-ons, options, and the menus where they can be selected.</p>
        </div>
        <Button type="button" className="hidden sm:inline-flex" onClick={() => setIsCreateOpen(true)} disabled={!categories.length}>
          <Plus /> Add modifier
        </Button>
      </header>

      <section aria-label="Modifier overview" className="grid grid-cols-1 divide-y rounded-xl border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700"><SlidersHorizontal className="size-4" /></span>
          <div><p className="text-lg font-semibold tabular-nums">{modifiers.length}</p><p className="text-xs text-muted-foreground">Modifiers</p></div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-800"><Tags className="size-4" /></span>
          <div><p className="text-lg font-semibold tabular-nums">{categories.length}</p><p className="text-xs text-muted-foreground">Categories</p></div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-700"><Utensils className="size-4" /></span>
          <div><p className="text-lg font-semibold tabular-nums">{assignments.length}</p><p className="text-xs text-muted-foreground">Menu assignments</p></div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-col gap-3 border-b bg-muted/30 p-3 lg:flex-row lg:items-center lg:justify-between">
          <InputGroup className="max-w-md">
            <InputGroupAddon align="inline-start" className="text-muted-foreground"><Search className="size-4" /></InputGroupAddon>
            <InputGroupInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search modifiers, recipes, or categories"
              aria-label="Search modifiers"
            />
          </InputGroup>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value ?? "all")}>
              <SelectTrigger className="w-full sm:w-[190px]" aria-label="Filter by category">
                <SelectValue>{categoryFilter === "all" ? "All categories" : categories.find((category) => String(category.id) === categoryFilter)?.category}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.category}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" className="sm:hidden" onClick={() => setIsCreateOpen(true)} disabled={!categories.length}>
              <Plus /> Add modifier
            </Button>
          </div>
        </div>

        <div className="grid gap-5 p-4 xl:grid-cols-[minmax(0,1fr)_300px]">
          <ModifierListSection
            modifiers={filteredModifiers}
            categories={categories}
            recipes={recipes}
            menus={menus}
            assignments={assignments}
            onCreate={() => setIsCreateOpen(true)}
            hasFilters={Boolean(query) || categoryFilter !== "all"}
            onClearFilters={() => { setSearch(""); setCategoryFilter("all") }}
          />
          <ModifierCategoriesSection categories={categories} modifiers={modifiers} />
        </div>
      </section>

      <ModifierEditorDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        categories={categories}
        recipes={recipes}
      />
    </main>
  )
}