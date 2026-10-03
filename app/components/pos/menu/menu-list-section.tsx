import { useNavigation } from "react-router"
import { ArrowRight, CookingPot, Utensils as MenuIcon } from "lucide-react"
import { Link } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty"
import { Skeleton } from "~/components/ui/skeleton"
import type { CategoryDataType } from "~/components/ui/categories-manager"
import type { RecipeDetailsType } from "~/components/inventory/recipe-mapping/manage-recipe/header"
import { MenuStatusBadge } from "./menu-status"
import type { MenuStatus } from "~/utils/menu-status"

export type MenuListItem = {
  id?: string | number
  name?: string
  menu_name?: string
  category_id?: string | number
  category?: string
  category_name?: string
  recipe_id?: string | number
  recipe_name?: string
  selling_price?: number | string
  description?: string | null
  status?: MenuStatus
}

type ComponentProps = {
  menu_list: MenuListItem[]
  categories: CategoryDataType[]
  available_recipes: RecipeDetailsType[]
  search: string
  selectedCategory: string
  onAddMenu: () => void
  onClearFilters: () => void
}

export function MenuListSection({
  menu_list,
  categories,
  available_recipes,
  search,
  selectedCategory,
  onAddMenu,
  onClearFilters,
}: ComponentProps) {
  const navigation = useNavigation()
  const isLoading = navigation.state !== "idle"
  const query = search.trim().toLowerCase()
  const filteredMenus = menu_list.filter((menu) => {
    const category = menu.category_name
      ?? menu.category
      ?? categories.find((item) => String(item.id) === String(menu.category_id))?.category
      ?? "Uncategorized"
    const recipe = menu.recipe_name
      ?? available_recipes.find((item) => String(item.recipe_id) === String(menu.recipe_id))?.recipe_name
      ?? ""
    const menuName = menu.name ?? menu.menu_name ?? "Untitled menu item"
    const matchesSearch = [menuName, category, recipe, menu.description ?? ""]
      .some((value) => value.toLowerCase().includes(query))
    const matchesCategory = selectedCategory === "all" || String(menu.category_id) === selectedCategory

    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 p-3 animate-in fade-in duration-500 ease-out sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (filteredMenus.length === 0) {
    const hasFilters = Boolean(query) || selectedCategory !== "all"

    return (
      <Empty className="py-20 animate-in fade-in duration-500 ease-out">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            {hasFilters ? <CookingPot /> : <MenuIcon />}
          </EmptyMedia>
          <EmptyTitle>{hasFilters ? "No menu items found" : "No menu items yet"}</EmptyTitle>
          <EmptyDescription>
            {hasFilters
              ? "Try a different search or category filter."
              : "Add your restaurant's recipes here to start building the menu."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {hasFilters ? (
            <Button type="button" variant="outline" onClick={onClearFilters}>Clear filters</Button>
          ) : (
            <Button type="button" onClick={onAddMenu}> Add your first menu item</Button>
          )}
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="relative grid max-h-[70vh] grid-cols-1 gap-3 overflow-y-auto p-3 sm:grid-cols-2 lg:grid-cols-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/40">
      {filteredMenus.map((menu, index) => {
        const category = menu.category_name
          ?? menu.category
          ?? categories.find((item) => String(item.id) === String(menu.category_id))?.category
          ?? "Uncategorized"
        const recipe = menu.recipe_name
          ?? available_recipes.find((item) => String(item.recipe_id) === String(menu.recipe_id))?.recipe_name
          ?? "Recipe not linked"
        const menuName = menu.name ?? menu.menu_name ?? "Untitled menu item"

        return (
          <article
            key={menu.id ?? `${menuName}-${index}`}
            className="animate-in fade-in duration-500 rounded-lg border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
          >
            <div className="flex min-h-20 flex-col justify-between">
              <div className="min-w-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate">{category}</span>
                  <MenuStatusBadge status={menu.status} />
                </div>
                <h2 className="truncate text-sm font-semibold text-foreground" title={menuName}>
                    <Button
                    type="button"
                    variant="link"
                    size="xs"
                    className="pl-0"
                    nativeButton={false}
                    disabled={menu.id === undefined || menu.id === null}
                    render={<Link to={`/pos/menu/${menu.id}`} />}
                    >
                    {menuName}
                  <ArrowRight />
                </Button>
                </h2>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground" title={recipe}>
                  <CookingPot className="size-3.5 shrink-0" />
                  <span className="truncate">{recipe}</span>
                </p>
                {menu.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{menu.description}</p>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}