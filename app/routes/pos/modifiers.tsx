import { isAxiosError } from "axios"
import api from "~/lib/axios"
import { toast } from "sonner"
import type { Route } from "./+types/modifiers"
import { ModifierWorkspace } from "~/components/pos/modifiers/modifier-workspace"
import type { MenuModifierAssignment, Modifier, ModifierCategory, ModifierMenu, ModifierRecipe } from "~/components/pos/modifiers/modifier-types"

const toArray = <T,>(responseData: unknown): T[] => {
  if (Array.isArray(responseData)) return responseData as T[]
  if (responseData && typeof responseData === "object" && "data" in responseData && Array.isArray(responseData.data)) {
    return responseData.data as T[]
  }
  return []
}

export async function clientLoader(_: Route.ClientLoaderArgs) {
  const [categoriesResult, modifiersResult, recipesResult, menusResult, assignmentsResult] = await Promise.all([
    api.get("v1/modifier-categories").then((response) => toArray<ModifierCategory>(response.data)).catch(() => []),
    api.get("v1/modifiers").then((response) => toArray<Modifier>(response.data)).catch(() => []),
    api.get("v1/recipes?status=available").then((response) => toArray<ModifierRecipe>(response.data)).catch(() => []),
    api.get("v1/menus").then((response) => toArray<ModifierMenu>(response.data)).catch(() => []),
    api.get("v1/menu-modifiers").then((response) => toArray<MenuModifierAssignment>(response.data)).catch(() => []),
  ])

  return {
    categories: categoriesResult,
    modifiers: modifiersResult,
    recipes: recipesResult,
    menus: menusResult,
    assignments: assignmentsResult,
  }
}

export async function clientAction({ request }: Route.ClientActionArgs) {
  if (request.method !== "POST") return

  const data = Object.fromEntries(await request.formData())
  const intent = data.intent

  try {
    let requestPromise: Promise<unknown>
    let loadingMessage: string
    let successMessage: string

    switch (intent) {
      case "create_modifier_category":
        requestPromise = api.post("v1/modifier-categories", { category: data.category })
        loadingMessage = "Creating category..."
        successMessage = "Modifier category created."
        break
      case "update_modifier_category":
        requestPromise = api.put(`v1/modifier-categories/${data.category_id}`, { category: data.category })
        loadingMessage = "Updating category..."
        successMessage = "Modifier category updated."
        break
      case "delete_modifier_category":
        requestPromise = api.delete(`v1/modifier-categories/${data.category_id}`)
        loadingMessage = "Deleting category..."
        successMessage = "Modifier category deleted."
        break
      case "create_modifier":
        requestPromise = api.post("v1/modifiers", {
          category_id: Number(data.category_id),
          name: data.name,
          price: Number(data.price),
          recipe_id: data.recipe_id || null,
          description: data.description || null,
        })
        loadingMessage = "Creating modifier..."
        successMessage = "Modifier created."
        break
      case "update_modifier":
        requestPromise = api.put(`v1/modifiers/${data.modifier_id}`, {
          category_id: Number(data.category_id),
          name: data.name,
          price: Number(data.price),
          recipe_id: data.recipe_id || null,
          description: data.description || null,
        })
        loadingMessage = "Updating modifier..."
        successMessage = "Modifier updated."
        break
      case "delete_modifier":
        requestPromise = api.delete(`v1/modifiers/${data.modifier_id}`)
        loadingMessage = "Deleting modifier..."
        successMessage = "Modifier deleted."
        break
      case "assign_modifier":
        requestPromise = api.post("v1/menu-modifiers", {
          menu_id: data.menu_id,
          modifier_id: data.modifier_id,
        })
        loadingMessage = "Assigning modifier..."
        successMessage = "Modifier assigned to menu."
        break
      case "remove_menu_assignment":
        requestPromise = api.delete(`v1/menu-modifiers/${data.assignment_id}`)
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