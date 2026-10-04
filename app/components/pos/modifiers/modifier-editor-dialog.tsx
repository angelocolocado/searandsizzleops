import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Coins, Pencil, Sparkles, Utensils } from "lucide-react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import type { IngredientOption, Modifier, ModifierCategory, ModifierRecipe } from "./modifier-types"

type ComponentProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: ModifierCategory[]
  recipes: ModifierRecipe[]
  ingredients: IngredientOption[]
  modifier?: Modifier
}

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === undefined || value === null || value === "") {
    return "Cost unavailable"
  }

  const amount = Number(value ?? 0)

  if (!Number.isFinite(amount)) {
    return "Cost unavailable"
  }

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)
}

export function ModifierEditorDialog({ open, onOpenChange, categories, recipes, ingredients, modifier }: ComponentProps) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"
  const isEdit = Boolean(modifier)

  const [name, setName] = useState(modifier?.name ?? "")
  const [categoryId, setCategoryId] = useState(String(modifier?.category_id ?? categories[0]?.id ?? ""))
  const [sourceType, setSourceType] = useState<"ingredient" | "recipe">(
    modifier?.ingredient_id ? "ingredient" : modifier?.source_recipe_id ? "recipe" : "ingredient",
  )
  const [ingredientId, setIngredientId] = useState(modifier?.ingredient_id ? String(modifier.ingredient_id) : "")
  const [sourceRecipeId, setSourceRecipeId] = useState(modifier?.source_recipe_id ?? "")

  useEffect(() => {
    if (!modifier) {
      setName("")
      setCategoryId(categories[0]?.id ? String(categories[0].id) : "")
      setSourceType("ingredient")
      setIngredientId("")
      setSourceRecipeId("")
      return
    }

    setName(modifier.name)
    setCategoryId(String(modifier.category_id))
    setSourceType(modifier.ingredient_id ? "ingredient" : modifier.source_recipe_id ? "recipe" : "ingredient")
    setIngredientId(modifier.ingredient_id ? String(modifier.ingredient_id) : "")
    setSourceRecipeId(modifier.source_recipe_id ?? "")
  }, [categories, modifier])

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && (fetcher.data.intent === "create_modifier" || fetcher.data.intent === "update_modifier")) {
      onOpenChange(false)
    }
  }, [fetcher.data, fetcher.state, onOpenChange])

  const selectedIngredient = useMemo(
    () => ingredients.find((item) => String(item.id) === ingredientId) ?? null,
    [ingredientId, ingredients],
  )

  const selectedRecipe = useMemo(
    () => recipes.find((item) => String(item.id ?? item.recipe_id ?? "") === sourceRecipeId) ?? null,
    [recipes, sourceRecipeId],
  )

  const selectedCategoryLabel = categories.find((item) => String(item.id) === categoryId)?.category ?? "Choose a category"
  const selectedIngredientLabel = selectedIngredient?.item_name ?? selectedIngredient?.name ?? "Select ingredient"
  const selectedRecipeLabel = selectedRecipe?.recipe_name ?? selectedRecipe?.name ?? "Select source recipe"
  const ingredientBaseUnit = selectedIngredient?.unit === "pcs"
    ? "per piece"
    : ["g", "kg", "lb", "oz"].includes(selectedIngredient?.unit ?? "")
      ? "per gram"
      : ["mL", "L", "fl oz"].includes(selectedIngredient?.unit ?? "")
        ? "per milliliter"
        : "per base unit"

  const normalizedName = (name ?? "").trim()
  const hasValidSource = sourceType === "ingredient" ? Boolean(ingredientId) : Boolean(sourceRecipeId)
  const canSubmit = normalizedName.length >= 2 && Boolean(categoryId) && hasValidSource

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canSubmit) {
      return
    }

    fetcher.submit(
      {
        intent: isEdit ? "update_modifier" : "create_modifier",
        category_id: String(categoryId),
        name: normalizedName,
        ...(isEdit ? { modifier_id: modifier?.id ?? "" } : {}),
        ingredient_id: sourceType === "ingredient" ? String(ingredientId) : "",
        source_recipe_id: sourceType === "recipe" ? sourceRecipeId : "",
      },
      { method: "post", action: "/pos/modifiers" },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${modifier?.name ?? "modifier"}` : "Create modifier"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the display name and the single cost source for this modifier."
              : "Create a custom modifier with a display name and exactly one ingredient or recipe source."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="modifier-name" className="text-sm font-medium">Display name</label>
            <Input
              id="modifier-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Plain Rice"
              maxLength={255}
              aria-invalid={normalizedName.length > 0 && normalizedName.length < 2}
            />
            <p className="text-xs text-muted-foreground">Use the custom name customers will see on the menu.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue>{categoryId ? selectedCategoryLabel : "Choose a category"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cost source</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={sourceType === "ingredient" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSourceType("ingredient")}
                >
                  <Coins className="size-4" /> Ingredient
                </Button>
                <Button
                  type="button"
                  variant={sourceType === "recipe" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSourceType("recipe")}
                >
                  <Utensils className="size-4" /> Recipe
                </Button>
              </div>
            </div>
          </div>

          {sourceType === "ingredient" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Ingredient source</label>
              <Select value={ingredientId} onValueChange={(value) => setIngredientId(value ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue>{ingredientId ? selectedIngredientLabel : "Select ingredient"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ingredients.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={String(ingredient.id)}>
                        {ingredient.item_name ?? ingredient.name ?? `Ingredient ${ingredient.id}`}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {selectedIngredient && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Ingredient</p>
                      <p className="mt-1 text-sm font-medium">{selectedIngredient.item_name ?? selectedIngredient.name ?? "Ingredient"}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700">
                      <Sparkles className="size-3.5" />
                      {formatCurrency(selectedIngredient.cost_per_base)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Base cost: {formatCurrency(selectedIngredient.cost_per_base)} {ingredientBaseUnit}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipe source</label>
              <Select value={sourceRecipeId} onValueChange={(value) => setSourceRecipeId(value ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue>{sourceRecipeId ? selectedRecipeLabel : "Select source recipe"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {recipes.map((recipe) => {
                      const recipeId = recipe.id ?? recipe.recipe_id ?? ""
                      const label = recipe.recipe_name ?? recipe.name ?? recipeId

                      return (
                        <SelectItem key={recipeId} value={recipeId}>
                          {label}
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>

              {selectedRecipe && (
                <div className="rounded-lg border bg-muted/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Recipe</p>
                      <p className="mt-1 text-sm font-medium">{selectedRecipe.recipe_name ?? selectedRecipe.name ?? "Recipe"}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-1 text-xs font-medium text-sky-700">
                      <Pencil className="size-3.5" /> Cost from recipe ingredients
                    </span>
                  </div>
                  {selectedRecipe.category?.toLowerCase() === "addon" && selectedRecipe.selling_price != null && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Addon selling price: {formatCurrency(selectedRecipe.selling_price)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="rounded-lg border border-dashed bg-muted/20 p-3 text-xs text-muted-foreground">
            Modifier cost is calculated by the server from the selected source. The client should not submit a custom price or cost.
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>} />
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create modifier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
