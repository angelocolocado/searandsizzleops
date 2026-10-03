import { isAxiosError } from "axios"
import api from "~/lib/axios"
import { toast } from "sonner"
import type { Route } from "./+types/menu-detail"
import { MenuDetailPage } from "~/components/pos/menu/menu-detail/menu-detail-page"

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  if (!params.id) {
    return { menu: null, recipes: [], modifiers: [], assignments: [] }
  }

  const [menuResult, recipesResult, modifiersResult, assignmentsResult] = await Promise.all([
    api.get(`v1/menus/${params.id}`).then((response) => response.data).catch(() => null),
    api.get("v1/recipes?status=available").then((response) => response.data).catch(() => []),
    api.get("v1/modifiers").then((response) => response.data).catch(() => []),
    api.get("v1/menu-modifiers").then((response) => response.data).catch(() => []),
  ])

  const menu = menuResult?.data ?? menuResult?.menu ?? menuResult

  return {
    menu: menu && !Array.isArray(menu) ? menu : null,
    recipes: Array.isArray(recipesResult) ? recipesResult : [],
    modifiers: Array.isArray(modifiersResult) ? modifiersResult : [],
    assignments: Array.isArray(assignmentsResult) ? assignmentsResult : [],
  }
}

export async function clientAction({ request, params }: Route.ClientActionArgs) {
  if (request.method !== "POST" || !params.id) return

  const formData = Object.fromEntries(await request.formData())
  const intent = formData.intent
  const menuId = params.id

  try {
    let requestPromise: Promise<unknown>
    let loadingMessage: string
    let successMessage: string

    switch (intent) {
      case "assign_recipe":
        requestPromise = api.post(`v1/menu-content`, { menu_id: menuId, recipe_id: formData.recipe_id })
        loadingMessage = "Adding recipe to menu..."
        successMessage = "Recipe added to menu."
        break
      case "remove_recipe":
        requestPromise = api.delete(`v1/menu-content/${formData.recipe_id}`, {
          data: { menu_id: menuId },
        })
        loadingMessage = "Removing recipe from menu..."
        successMessage = "Recipe removed from menu."
        break
      case "update_selling_price":
        requestPromise = api.put(`v1/menus/${menuId}`, {
          selling_price: formData.selling_price === "" ? null : Number(formData.selling_price),
        })
        loadingMessage = "Saving selling price..."
        successMessage = "Selling price updated."
        break
      case "update_details":
        requestPromise = api.put(`v1/menus/${menuId}`, {
          name: formData.name,
          description: formData.description === "" ? null : formData.description,
          status: Number(formData.status),
        })
        loadingMessage = "Saving menu details..."
        successMessage = "Menu details updated."
        break
      case "update_status":
        requestPromise = api.put(`v1/menus/${menuId}`, { status: Number(formData.status) })
        loadingMessage = "Updating menu availability..."
        successMessage = "Menu availability updated."
        break
      case "add_modifier":
        requestPromise = api.post("v1/menu-modifiers", { menu_id: menuId, modifier_id: formData.modifier_id })
        loadingMessage = "Adding modifier..."
        successMessage = "Modifier added."
        break
      case "remove_modifier":
        requestPromise = api.delete(`v1/menu-modifiers/${formData.assignment_id}`)
        loadingMessage = "Removing modifier..."
        successMessage = "Modifier removed."
        break
      case "delete_menu":
        requestPromise = api.delete(`v1/menus/${menuId}`)
        loadingMessage = "Deleting menu..."
        successMessage = "Menu deleted."
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
    return {
      success: true,
      intent,
    }
  } catch (error) {
    return {
      success: false,
      intent,
      message: isAxiosError(error) ? error.response?.data?.message : undefined,
    }
  }
}

export default function MenuDetailRoute({ loaderData, params }: Route.ComponentProps) {
  return (
    <MenuDetailPage
      menu={loaderData.menu}
      recipes={loaderData.recipes}
      modifiers={loaderData.modifiers}
      assignments={loaderData.assignments}
      menuId={params.id}
    />
  )
}