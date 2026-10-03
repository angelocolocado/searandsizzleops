"use client"

import { Drawer } from "~/components/ui/drawer"
import { useIsMobile } from "~/hooks/use-mobile"
import { CategoriesManager, type CategoryDataType } from "~/components/ui/categories-manager"
import { DataNav } from "../data-nav"
import { useNavigate } from "react-router"
import { RecipeSection } from "./recipe-section"
import {
  Dialog
} from "~/components/ui/dialog"
import { useState } from "react"
import { SetupRecipeDialog } from "./setup-dialog"
import { CookingPot, Tags } from "lucide-react"

export type RecipesPreviewDataType = {
  recipe_name: string
  updated_at: string
  created_at: string
  status: string
  id: string
  category: string
}

type ComponentProps = {
  recipes_data: RecipesPreviewDataType[]
  categories_data: CategoryDataType[] 
}

export function RecipeMapping({ categories_data, recipes_data } : ComponentProps) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleFilterChange = (value: string | null) => {
    if(!value) return
    
    if(value == "All") {
      return navigate('/inventory/recipes')
    }

    const params = new URLSearchParams()
    params.set("category", value.toLowerCase())
    navigate(`?${params.toString()}`)
  }

  const availableRecipeCount = recipes_data.filter((recipe) => recipe.status.toLowerCase() === "available").length

  return (
    <>
      <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">
        <header className="mb-5 flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase text-muted-foreground">
              <CookingPot className="size-3.5" /> Inventory management
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Recipe mapping</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Build recipes from ingredient stock, then publish them for menu configuration.</p>
          </div>
          <div className="flex gap-5 text-xs sm:border-l sm:pl-5">
            <div><p className="text-lg font-semibold tabular-nums text-foreground">{recipes_data.length}</p><p className="text-muted-foreground">Recipes</p></div>
            <div><p className="text-lg font-semibold tabular-nums text-foreground">{availableRecipeCount}</p><p className="text-muted-foreground">Available</p></div>
            <div><p className="flex items-center gap-1.5 text-lg font-semibold tabular-nums text-foreground"><Tags className="size-4 text-muted-foreground" />{categories_data.length}</p><p className="text-muted-foreground">Categories</p></div>
          </div>
        </header>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="space-y-5">
            <section className="min-h-[60vh] overflow-hidden rounded-2xl border bg-card shadow-sm">
              <DataNav mode="recipe" filter={categories_data} handleFilter={handleFilterChange} handleOpen={() => setIsDialogOpen(!isDialogOpen)} />
              <RecipeSection recipes_data={recipes_data} />
            </section>
          </div>

          <CategoriesManager from="recipe-mapping" actionPath="/categories" title="Recipes Category" categories_data={categories_data} />
          <SetupRecipeDialog categories_data={categories_data} />
          
        </Dialog>
      </main>
    </>
  )
}