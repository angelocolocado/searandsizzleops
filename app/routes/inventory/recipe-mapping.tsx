import { RecipeMapping } from "~/components/inventory/recipe-mapping/recipe-mapping";
import type { Route } from "./+types/recipe-mapping";
import api from "~/lib/axios";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader({ request } : Route.ClientLoaderArgs){
  try{

    const url = new URL(request.url)
    const category = url.searchParams.get("category");

    let recipes

    if(category){
      recipes = await api.get(`/v1/recipes/${encodeURIComponent(category)}`)
    } else {
      recipes = await api.get(`/v1/recipes`)
    }

    const categories = await api.get('/v1/recipe-categories')

    return {
      recipes: recipes.data,
      categories: categories.data
    }
  } catch(err) {
    return {
      recipes: [],
      categories: []
    }
  }

}

export async function clientAction({ request } : Route.ClientActionArgs){
  if(request.method !== "POST") return

  const formData = await request.formData()
  const data = Object.fromEntries(formData)


  if(data.intent === "setup_recipe") return await handleSetupRecipe(data)
  else if(data.intent === "edit_recipe") return await handleUpdateRecipe(data)
  else if(data.intent === "delete_recipe") return await handleDeleteRecipe(data)
}

async function handleDeleteRecipe(data: any){
  try{
    const requestPromise = api.delete(`v1/recipes/${data.id}`)

    toast.promise(requestPromise, {
      loading: "Deleting Recipe...",
      success: "Recipe deleted successfully!",
      error: (err) => isAxiosError(err)
        ? err.response?.data?.message || "Something went wrong while deleting the recipe."
        : "Something went wrong while deleting the recipe.",
    })

    await requestPromise

    return {
      success: true,
      intent: "delete_recipe",
    }
  } catch {
    return {
      success: false,
      intent: "delete_recipe",
    }
  }
}

async function handleUpdateRecipe(data: any){

  try{
    const requestPromise = api.put(`v1/recipes/${data.id}`, data)

    toast.promise(requestPromise, {
      loading: "Updating Recipe...",
      success: "Recipe updated!",
      error: (err) => {
        if(isAxiosError(err)){
          return err.response?.data?.message || "Something went wrong, Please try again later."
        }
      }
    })

    const result = await requestPromise

    return {
      success: true,
      intent: "edit_recipe",
      id: result.data.id || data.id
    }
  } catch(err) {
    return {
      success: false,
      intent: "edit_recipe"
    }
  }
}

async function handleSetupRecipe(data: any){
  try{
    const requestPromise = api.post('v1/recipes', data)

    toast.promise(requestPromise, {
      loading: "Creating Recipe...",
      error: (err) => {
        if(isAxiosError(err)){
          return err.response?.data?.message || "Something went wrong, Please try again later."
        }
      }
    })

    const result = await requestPromise

    return {
      success: true,
      intent: "setup_recipe",
      id: result.data.id
    }
  } catch(err) {
    return {
      success: false,
      intent: "setup_recipe"
    }
  }
}

export default function InventoryStock({ loaderData } : Route.ComponentProps) {

  return <RecipeMapping categories_data={loaderData.categories} recipes_data={loaderData.recipes} />
}