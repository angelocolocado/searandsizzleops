"use client"

import { Drawer } from "~/components/ui/drawer"
import { useIsMobile } from "~/hooks/use-mobile"
import { CategoriesManager } from "../categories-manager"
import { DataNav } from "../data-nav"
import type { CategoryDataType } from "../categories-manager"
import { useNavigate } from "react-router"
import { RecipeSection } from "./recipe-section"
import {
  Dialog
} from "~/components/ui/dialog"
import { useState } from "react"
import { SetupRecipeDialog } from "./setup-dialog"

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

  return (
    <>
      <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <div className="space-y-5">
            <section className="min-h-[60vh] overflow-hidden rounded-2xl border bg-card shadow-sm">
              <DataNav mode="recipe" filter={categories_data} handleFilter={handleFilterChange} handleOpen={() => setIsDialogOpen(!isDialogOpen)} />
              <RecipeSection recipes_data={recipes_data} />
            </section>
          </div>

          <CategoriesManager from="recipe-mapping" categories_data={categories_data} />
          <SetupRecipeDialog categories_data={categories_data} />
          
        </Dialog>
      </main>
    </>
  )
}