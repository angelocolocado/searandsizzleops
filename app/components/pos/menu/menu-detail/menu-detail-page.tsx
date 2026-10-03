import { ArrowLeft, CalendarDays, Clock3, Utensils } from "lucide-react"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import { MenuDangerZone } from "./menu-danger-zone"
import { MenuModifiersSection, type MenuModifier } from "./menu-modifiers-section"
import { MenuCostsSection, type MenuCostsBreakdown } from "./menu-costs-section"
import { MenuEditDialog } from "./menu-edit-dialog"
import { MenuSellingPriceSection } from "./menu-profit-section"
import { MenuRecipeSection, type MenuRecipe } from "./menu-recipe-section"
import { MenuAvailabilityControl } from "./menu-availability-control"
import { MenuStatusBadge } from "../menu-status"

export type MenuDetail = {
  id?: string | number
  name?: string
  category?: string
  description?: string | null
  selling_price?: number | string | null
  profit?: number | string | null
  recipes?: MenuRecipe[] | null
  ingredient_costs?: number | string | null
  costs_breakdown?: MenuCostsBreakdown[] | null
  modifiers?: MenuModifier[] | null
  status?: string | number | null
  created_at?: string | null
  updated_at?: string | null
}

type ComponentProps = {
  menu: MenuDetail | null
  recipes: MenuRecipe[]
  modifiers: MenuModifier[]
  menuId: string
}

export function MenuDetailPage({ menu, recipes, modifiers, menuId }: ComponentProps) {
  if (!menu) {
    return (
      <main className="px-5 py-6">
        <Button variant="ghost" size="sm" className="mb-6" render={<Link to="/pos/menu" />}>
          <ArrowLeft /> Back to menus
        </Button>
        <section className="rounded-xl border bg-card px-5 py-12 text-center">
          <h1 className="text-lg font-semibold">Menu item not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This menu item may have been removed or is unavailable.</p>
        </section>
      </main>
    )
  }

  const menuName = menu.name ?? "Menu item"
  const categoryName = menu.category ?? "Menu category"
  const assignedRecipes = menu.recipes ?? []
  const assignedModifiers = menu.modifiers ?? []
  const formatDate = (date?: string | null) => {
    if (!date) return "Not available"
    const parsedDate = new Date(date)
    return Number.isNaN(parsedDate.getTime())
      ? "Not available"
      : parsedDate.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <main className="animate-in fade-in duration-500 space-y-5 px-5 py-5">
      <header className="space-y-4">
        <Button variant="ghost" size="sm" className="-ml-2" render={<Link to="/pos/menu" />}>
          <ArrowLeft /> Back to menus
        </Button>
        <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 uppercase"><Utensils className="size-3.5" />{categoryName}</span>
              <MenuStatusBadge status={menu.status} />
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold">{menuName}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{menu.description || "No description added."}</p>
          </div>
          <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:items-end">
            <span className="flex items-center gap-1.5"><CalendarDays className="size-3.5" />Created {formatDate(menu.created_at)}</span>
            <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />Updated {formatDate(menu.updated_at)}</span>
            <div className="flex flex-wrap items-center gap-2">
              <MenuAvailabilityControl menuId={menuId} status={menu.status} />
              <MenuEditDialog menuId={menuId} menu={menu} />
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
        <div className="space-y-5">
          <MenuRecipeSection
            menuId={menuId}
            recipes={recipes}
            assignedRecipes={assignedRecipes}
          />
          <MenuModifiersSection
            menuId={menuId}
            availableModifiers={modifiers}
            assignedModifiers={assignedModifiers}
          />
        </div>
        <div className="space-y-5">
          <MenuSellingPriceSection menuId={menuId} selling_price={menu.selling_price ?? menu.profit} />
          <MenuCostsSection
            ingredientCosts={menu.costs_breakdown ?? []}
            ingredientsTotal={menu.ingredient_costs}
            sellingPrice={menu.selling_price}
            profit={menu.profit}
          />
        </div>
      </div>

      <MenuDangerZone menuId={menuId} menuName={menuName} />
    </main>
  )
}