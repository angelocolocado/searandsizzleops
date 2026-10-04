
import { useCallback, useState } from "react"
import { useRevalidator } from "react-router"
import type { CategoryDataType } from "~/components/ui/categories-manager"
import { BuildRecipeHeader, type RecipeDetailsType } from "./header"
import { BuildRecipeFooter } from "./footer"
import { BuildRecipeWindow } from "./build-recipe-window"
import type { IngredientDataType } from "../../ingredients-stock/ingredient-stock-table/columns"

type ComponentProps = {
    recipe_details?: RecipeDetailsType | null
    categories_data: CategoryDataType[]
    ingredient_data: IngredientDataType[]
}


export default function BuildRecipe({ recipe_details, categories_data, ingredient_data }: ComponentProps) {
    const { revalidate } = useRevalidator()
    const handleEditSuccess = useCallback(() => {
        revalidate()
    }, [revalidate])

    return (
        <main className="animate-in fade-in duration-500 ease-out scroll-smooth px-5 py-4">
            <BuildRecipeHeader
                recipe_details={recipe_details}
                categories_data={categories_data}
                ingredient_data={ingredient_data}
                handleEditSuccess={handleEditSuccess}
            />

            <BuildRecipeWindow
                recipe_id={recipe_details?.recipe_id}
                ingredient_data={ingredient_data}
                recipe_ingredients={recipe_details?.recipe_ingredients || []}
                isActive={String(recipe_details?.status).toLowerCase() === "available"}
            />

            <BuildRecipeFooter
                deleting_id={recipe_details?.recipe_id}
                recipe_name={recipe_details?.recipe_name}
            />
        </main>
    )
}