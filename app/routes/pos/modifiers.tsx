import { isAxiosError } from "axios"
import api from "~/lib/axios"
import { toast } from "sonner"
import type { Route } from "./+types/modifiers"
import { ModifierWorkspace } from "~/components/pos/modifiers/modifier-workspace"
import type { IngredientOption, MenuModifierAssignment, Modifier, ModifierCategory, ModifierMenu, ModifierRecipe } from "~/components/pos/modifiers/modifier-types"

const toArray = <T,>(responseData: unknown, resource: string): T[] => {
  if (Array.isArray(responseData)) return responseData as T[]
  if (responseData && typeof responseData === "object" && "data" in responseData && Array.isArray(responseData.data)) {
    return responseData.data as T[]
  }
  throw new Error(`Unexpected ${resource} response format.`)
}

export async function clientLoader(_: Route.ClientLoaderArgs) {
  const [categoriesResult, modifiersResult, recipesResult, ingredientsResult, menusResult, assignmentsResult] = await Promise.all([
    api.get("v1/modifier-categories").then((response) => toArray<ModifierCategory>(response.data, "modifier categories")),
    api.get("v1/modifiers").then((response) => toArray<Modifier>(response.data, "modifiers")),
    api.get("v1/recipes?status=available").then((response) => toArray<ModifierRecipe>(response.data, "available recipes")),
    api.get("/v1/ingredient-stocks").then((response) => toArray<IngredientOption>(response.data, "ingredient stocks")),
    api.get("v1/menus").then((response) => toArray<ModifierMenu>(response.data, "menus")),
    api.get("v1/menu-modifiers").then((response) => toArray<MenuModifierAssignment>(response.data, "menu modifier assignments")),
  ])

  return {
    categories: categoriesResult,
    modifiers: modifiersResult,
    recipes: recipesResult,
    ingredients: ingredientsResult,
    menus: menusResult,
    assignments: assignmentsResult,
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  if (request.method !== "POST") return

  const data = Object.fromEntries(await request.formData()) as Record<string, FormDataEntryValue | null>
  const getTextValue = (value: FormDataEntryValue | null | undefined) => typeof value === "string" ? value : ""
  const intent = getTextValue(data.intent)

  try {
    let requestPromise: Promise<unknown>
    let loadingMessage: string
    let successMessage: string

    switch (intent) {
      case "create_modifier_category":
        requestPromise = api.post("v1/modifier-categories", { category: getTextValue(data.category) })
        loadingMessage = "Creating category..."
        successMessage = "Modifier category created."
        break
      case "update_modifier_category":
        requestPromise = api.put(`v1/modifier-categories/${getTextValue(data.category_id)}`, { category: getTextValue(data.category) })
        loadingMessage = "Updating category..."
        successMessage = "Modifier category updated."
        break
      case "delete_modifier_category":
        requestPromise = api.delete(`v1/modifier-categories/${getTextValue(data.category_id)}`)
        loadingMessage = "Deleting category..."
        successMessage = "Modifier category deleted."
        break
      case "create_modifier": {
        const categoryId = Number(getTextValue(data.category_id))
        const name = getTextValue(data.name).trim()
        const ingredientId = getTextValue(data.ingredient_id)
        const sourceRecipeId = getTextValue(data.source_recipe_id)

        const payload: Record<string, number | string | null> = {
          category_id: categoryId,
          name,
          ingredient_id: ingredientId.trim() ? Number(ingredientId) : null,
          source_recipe_id: sourceRecipeId.trim() ? sourceRecipeId : null,
        }

        requestPromise = api.post("v1/modifiers", payload)
        loadingMessage = "Creating modifier..."
        successMessage = "Modifier created."
        break
      }
      case "update_modifier": {
        const categoryId = Number(getTextValue(data.category_id))
        const name = getTextValue(data.name).trim()
        const ingredientId = getTextValue(data.ingredient_id)
        const sourceRecipeId = getTextValue(data.source_recipe_id)

        const payload: Record<string, number | string | null> = {
          category_id: categoryId,
          name,
          ingredient_id: ingredientId.trim() ? Number(ingredientId) : null,
          source_recipe_id: sourceRecipeId.trim() ? sourceRecipeId : null,
        }

        requestPromise = api.put(`v1/modifiers/${getTextValue(data.modifier_id)}`, payload)
        loadingMessage = "Updating modifier..."
        successMessage = "Modifier updated."
        break
      }
      case "delete_modifier":
        requestPromise = api.delete(`v1/modifiers/${getTextValue(data.modifier_id)}`)
        loadingMessage = "Deleting modifier..."
        successMessage = "Modifier deleted."
        break
      case "assign_modifier":
        requestPromise = api.post("v1/menu-modifiers", {
          menu_id: getTextValue(data.menu_id),
          modifier_id: getTextValue(data.modifier_id),
        })
        loadingMessage = "Assigning modifier..."
        successMessage = "Modifier assigned to menu."
        break
      case "remove_menu_assignment":
        requestPromise = api.delete(`v1/menu-modifiers/${getTextValue(data.assignment_id)}`)
        loadingMessage = "Removing menu assignment..."
        successMessage = "Modifier removed from menu."
        break
      default:
        return
    }

    toast.promise(requestPromise, {
      loading: loadingMessage,
      success: successMessage,
      error: (error) => isAxiosError(error)
        ? error.response?.data?.message || "Something went wrong. Please try again."
        : "Something went wrong. Please try again.",
    })

    await requestPromise
    return { success: true, intent }
  } catch (error) {
    const message = isAxiosError(error)
      ? error.response?.data?.message || "Something went wrong. Please try again."
      : "Something went wrong. Please try again."
    return { success: false, intent, message }
  }
}

export default function ModifiersRoute({ loaderData }: Route.ComponentProps) {
  return <ModifierWorkspace {...loaderData} />
}