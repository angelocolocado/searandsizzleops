import { useEffect, useState } from "react"
import { CookingPot, Plus, Trash2 } from "lucide-react"
import { useFetcher } from "react-router"
import { Button } from "~/components/ui/button"
import { Field, FieldContent, FieldError, FieldLabel } from "~/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"

export type MenuRecipe = {
  id?: string | number
  recipe_id?: string | number
  name?: string
  recipe_name?: string
}

type ComponentProps = {
  menuId: string
  recipes: MenuRecipe[]
  assignedRecipes: MenuRecipe[]
}

const getRecipeId = (recipe: MenuRecipe) => recipe.recipe_id ?? recipe.id
const getRecipeName = (recipe: MenuRecipe) => recipe.recipe_name ?? recipe.name ?? "Unnamed recipe"

export function MenuRecipeSection({ menuId, recipes, assignedRecipes }: ComponentProps) {
  const [recipeId, setRecipeId] = useState("")
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"

  const assignedIds = new Set(assignedRecipes.map((recipe) => String(getRecipeId(recipe))))
  const unassignedRecipes = recipes.filter((recipe) => {
    const id = getRecipeId(recipe)
    return id !== undefined && id !== null && !assignedIds.has(String(id))
  })

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && fetcher.data?.intent === "assign_recipe") {
      setRecipeId("")
    }
  }, [fetcher.data, fetcher.state])

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="border-b px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Recipes</h2>
            <p className="mt-1 text-xs text-muted-foreground">Add one or more recipes used to prepare this menu item.</p>
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">{assignedRecipes.length}</span>
        </div>
      </header>
      <div className="space-y-4 p-4">
        {assignedRecipes.length ? (
          <ul className="divide-y rounded-lg border">
            {assignedRecipes.map((recipe, index) => {
              const id = getRecipeId(recipe)
              const recipeInfo = recipes.find((item) => String(getRecipeId(item)) === String(id))
              const name = getRecipeName(recipe) !== "Unnamed recipe"
                ? getRecipeName(recipe)
                : recipeInfo ? getRecipeName(recipeInfo) : "Recipe"

              return (
                <li key={String(id ?? index)} className="flex min-w-0 items-center gap-3 px-3 py-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"><CookingPot className="size-4" /></span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
                  <fetcher.Form method="post" action={`/pos/menu/${menuId}`}>
                    <input type="hidden" name="intent" value="remove_recipe" />
                    <input type="hidden" name="recipe_id" value={String(id ?? "")} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${name} from this menu`}
                      title={`Remove ${name}`}
                      disabled={isSubmitting || id === undefined || id === null}
                    >
                      <Trash2 />
                    </Button>
                  </fetcher.Form>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground">No recipe has been assigned yet.</p>
        )}

        <fetcher.Form method="post" action={`/pos/menu/${menuId}`} className="space-y-3">
          <Field>
            <FieldContent>
              <FieldLabel htmlFor="menu-recipe">Add another recipe</FieldLabel>
              <Select value={recipeId} onValueChange={(value) => setRecipeId(value ?? "")}>
                <SelectTrigger id="menu-recipe" className="w-full">
                  <SelectValue placeholder="Select a recipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {unassignedRecipes.map((recipe, index) => {
                      const id = getRecipeId(recipe)
                      if (id === undefined || id === null) return null
                      return <SelectItem key={String(id) || index} value={String(id)}>{getRecipeName(recipe)}</SelectItem>
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {!recipes.length && <FieldError>No available recipes found.</FieldError>}
              {recipes.length > 0 && unassignedRecipes.length === 0 && <p className="text-xs text-muted-foreground">All available recipes are already assigned.</p>}
            </FieldContent>
          </Field>
          <input type="hidden" name="intent" value="assign_recipe" />
          <input type="hidden" name="recipe_id" value={recipeId} />
          <Button type="submit" size="sm" disabled={!recipeId || isSubmitting}>
            <Plus /> {isSubmitting ? "Adding recipe..." : "Add recipe"}
          </Button>
        </fetcher.Form>
      </div>
    </section>
  )
}