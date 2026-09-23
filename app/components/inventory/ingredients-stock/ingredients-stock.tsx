"use client"

import { useEffect, useState } from "react"
import IngredientsStockTable from "./ingredient-stock-table/page"
import { Kpi } from "./kpi"
import { AddUpdateDrawer } from "./add-update-drawer"
import { Drawer } from "~/components/ui/drawer"
import { useIsMobile } from "~/hooks/use-mobile"
import { CategoriesManager, type CategoryDataType } from "~/components/ui/categories-manager"
import type { IngredientDataType } from "./ingredient-stock-table/columns"
import { DataNav } from "../data-nav"

type DrawerMode = "create" | "update"

type DrawerState = {
  open: boolean
  mode: DrawerMode
  item: IngredientDataType | null
}

type ComponentProps = {
  categories_data: CategoryDataType[]
  ingredients_data: IngredientDataType[]
}

export function IngredientsStock({ categories_data, ingredients_data } : ComponentProps) {
  
  const [drawerState, setDrawerState] = useState<DrawerState>({
    open: false,
    mode: "create",
    item: null,
  })

  const isMobile = useIsMobile()

  const openCreateDrawer = () => {
    setDrawerState({ open: true, mode: "create", item: null })
  }

  const openUpdateDrawer = (item: IngredientDataType) => {
    setDrawerState({ open: true, mode: "update", item })
  }


  return (
    <>
      <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">
        <Drawer
          open={drawerState.open}
          onOpenChange={(nextOpen) =>
            setDrawerState((prev) => ({
              ...prev,
              open: nextOpen,
            }))
          }
          showSwipeHandle={isMobile}
          swipeDirection={isMobile ? "down" : "right"}
        >
          <div className="space-y-5">
            <Kpi ingredients_data={ingredients_data} />
            <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <DataNav mode="ingredients" handleOpen={openCreateDrawer} />

              <div className="p-3">
                <IngredientsStockTable ingredients_data={ingredients_data} categories_data={categories_data} onEditItem={openUpdateDrawer} />
              </div>
            </section>
          </div>

          <CategoriesManager from="ingredient-stock" actionPath="/categories" title="Ingredients Category" categories_data={categories_data} />
          <AddUpdateDrawer
            categories={categories_data}
            open={drawerState.open}
            mode={drawerState.mode}
            item={drawerState.item}
            
            onOpenChange={(nextOpen) =>
              setDrawerState((prev) => ({
                ...prev,
                open: nextOpen,
              }))
            }
          />
        </Drawer>
      </main>
    </>
  )
}