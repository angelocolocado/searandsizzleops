import { cn } from "cn"
import { Button } from "~/components/ui/button"
import { Dialog } from "~/components/ui/dialog"
import { SetupRecipeDialog } from "../setup-dialog"
import { CalendarDays, Clock3, FileText, Pencil, Tag } from "lucide-react"
import { useState } from "react"
import type { CategoryDataType } from "~/components/ui/categories-manager"
import { PublishRecipeUI } from "./publish-recipe"
import type { IngredientDataType } from "../../ingredients-stock/ingredient-stock-table/columns"
import { getBaseUnitFactor } from "~/utils/uom"

export type RecipeIngredientType = {
    id: string
    ingredient_id?: string | number
    recipe_name: string
    quantity: string | number
    unit: string
    converted_qty_base_unit?: string | number
    cost_per_base?: string | number
    updated_at: string
}

export type RecipeDetailsType = {
    category: string
    created_at: string
    updated_at: string
    recipe_name: string
    recipe_id: string
    status: string
    yield_quantity: number
    yield_unit: string
    selling_price?: number | string | null
    notes?: string | null
    recipe_ingredients: RecipeIngredientType[]
}

type ComponentProps = {
    recipe_details?: RecipeDetailsType | null
    categories_data: CategoryDataType[]
    ingredient_data: IngredientDataType[]
    handleEditSuccess: () => void
}

const formatDate = (date?: string) => {
    if (!date) return "Not available"

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return "Not available"

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value)

const getIngredientCost = (
    recipeIngredient: RecipeIngredientType,
    ingredientData: IngredientDataType[],
): number | null => {
    const stockIngredientById = recipeIngredient.ingredient_id == null
        ? undefined
        : ingredientData.find((ingredient) => String(ingredient.id) === String(recipeIngredient.ingredient_id))
    const stockIngredient = stockIngredientById ?? ingredientData.find((ingredient) =>
        ingredient.item_name.trim().toLowerCase() === recipeIngredient.recipe_name.trim().toLowerCase(),
    )
    const rawCostPerBase = recipeIngredient.cost_per_base ?? stockIngredient?.cost_per_base
    const costPerBase = rawCostPerBase == null || rawCostPerBase === "" ? Number.NaN : Number(rawCostPerBase)
    const rawConvertedQuantity = recipeIngredient.converted_qty_base_unit
    const convertedQuantity = rawConvertedQuantity == null || rawConvertedQuantity === ""
        ? Number.NaN
        : Number(rawConvertedQuantity)
    const unitFactor = getBaseUnitFactor(recipeIngredient.unit)
    const quantity = Number(recipeIngredient.quantity)
    const quantityInBaseUnits = Number.isFinite(convertedQuantity)
        ? convertedQuantity
        : unitFactor !== null && Number.isFinite(quantity)
            ? quantity * unitFactor
            : Number.NaN

    if (!Number.isFinite(costPerBase) || costPerBase < 0 || !Number.isFinite(quantityInBaseUnits) || quantityInBaseUnits < 0) {
        return null
    }

    return costPerBase * quantityInBaseUnits
}

const getRecipeIngredientCost = (
    recipeIngredients: RecipeIngredientType[],
    ingredientData: IngredientDataType[],
): number | null => {
    let total = 0

    for (const recipeIngredient of recipeIngredients) {
        const cost = getIngredientCost(recipeIngredient, ingredientData)
        if (cost === null) return null
        total += cost
    }

    return total
}

export const statusStyles: Record<string, string> = {
    "Available":
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300",
    "Unavailable":
        "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:text-amber-300",
    "Incomplete":
        "border-red-500/20 bg-red-500/10 text-white-700 dark:border-violet-500/30 dark:text-violet-300",
}

export function BuildRecipeHeader({ recipe_details, categories_data, ingredient_data, handleEditSuccess }: ComponentProps){
    const status = recipe_details?.status || "draft"
    const [isEditOpen, setIsEditOpen] = useState(false)
    const isAddon = recipe_details?.category?.toLowerCase() === "addon"
    const ingredientCost = isAddon
        ? getRecipeIngredientCost(recipe_details?.recipe_ingredients ?? [], ingredient_data)
        : null
    const sellingPrice = recipe_details?.selling_price == null ? null : Number(recipe_details.selling_price)
    const hasSellingPrice = sellingPrice !== null && Number.isFinite(sellingPrice)
    const estimatedProfit = ingredientCost !== null && hasSellingPrice ? sellingPrice - ingredientCost : null

    return (<>
        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="bg-muted/20 px-5 py-4 sm:px-7 sm:py-5">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                                    <Tag className="size-3" />
                                    {recipe_details?.category || "Uncategorized"}
                                </span>
                                <span
                                    className={cn(
                                        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
                                        statusStyles[status] || "border-border bg-muted text-muted-foreground"
                                    )}
                                >
                                    {status}
                                </span>                   
                                <PublishRecipeUI recipe_status={recipe_details?.status || "Unknown"} />
                            </div>
                            <h1 className="max-w-3xl truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                {recipe_details?.recipe_name || "Recipe details"}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                Build and manage the ingredients, portions, and preparation for this recipe.
                            </p>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                                <Button size="sm" onClick={() => setIsEditOpen(true)}>
                                    <Pencil />
                                    Edit details
                                </Button>
                            </div>
                        </div>

                        <div className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-3 border-t pt-4 text-xs sm:flex sm:items-center sm:gap-6 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="size-3.5" />
                                <span>
                                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground/70">Created</span>
                                    <span className="font-medium text-foreground">{formatDate(recipe_details?.created_at)}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock3 className="size-3.5" />
                                <span>
                                    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground/70">Updated</span>
                                    <span className="font-medium text-foreground">{formatDate(recipe_details?.updated_at)}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 border-t pt-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl border bg-background/70 p-3.5">
                            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">Recipe yield</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                                {recipe_details?.yield_quantity ?? "-"} {recipe_details?.yield_unit || "unit"}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">Output deducted from ingredients per recipe sale.</p>
                        </div>
                        {isAddon && (
                            <>
                            <div className="rounded-xl border bg-background/70 p-3.5">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">Ingredient cost</p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    {ingredientCost === null ? "Cost unavailable" : formatCurrency(ingredientCost)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">Calculated from mapped ingredients and base-unit costs.</p>
                            </div>
                            <div className="rounded-xl border bg-background/70 p-3.5">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">Addon selling price</p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    {hasSellingPrice ? formatCurrency(sellingPrice) : "Not set"}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">Price charged to customers for this addon.</p>
                            </div>
                            <div className="rounded-xl border bg-background/70 p-3.5">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">Estimated profit</p>
                                <p className="mt-1 text-sm font-semibold text-foreground">
                                    {estimatedProfit === null ? "Unavailable" : formatCurrency(estimatedProfit)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">Selling price minus ingredient cost.</p>
                            </div>
                            </>
                        )}
                        <div className="rounded-xl border bg-background/70 p-3.5 sm:col-span-2 lg:col-span-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                                <FileText className="size-3.5" />
                                Notes
                            </div>
                            {recipe_details?.notes ? (
                                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">{recipe_details.notes}</p>
                            ) : (
                                <p className="mt-1.5 text-sm italic text-muted-foreground">No notes added yet.</p>
                            )}
                        </div>
                    </div>
                </div>
        </section>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <SetupRecipeDialog
                categories_data={categories_data}
                recipe_details={recipe_details}
                mode="edit"
                actionPath="/inventory/recipes"
                onSuccess={() => {
                    setIsEditOpen(false)
                    handleEditSuccess()
                }}
            />
        </Dialog>
    </>)
}