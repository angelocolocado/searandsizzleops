import BuildRecipe from "~/components/inventory/recipe-mapping/manage-recipe/build-recipe";
import type { CategoryDataType } from "~/components/inventory/categories-manager";
import type { Route } from "./+types/build-recipe";
import api from "~/lib/axios";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export function meta({} : Route.MetaArgs){
    return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader({ request } : Route.ClientLoaderArgs){

  const recipeId = new URL(request.url).pathname.split('/').filter(Boolean).pop()
  
  if(!recipeId) return

  try{
    const [recipeDetails, categories] = await Promise.all([
      api.get(`v1/recipe/${recipeId}`),
      api.get('/v1/recipe-categories'),
    ])

    return {
      recipeDetails: recipeDetails.data,
      categories: categories.data as CategoryDataType[],
    }
  } catch(err) {
    return {
      recipeDetails: null,
      categories: [] as CategoryDataType[],
    }
  }

}

export async function clientAction({ request, params } : Route.ClientActionArgs){
  if(request.method !== "POST" || !params.id) return

  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  if(data.intent !== "update_recipe") return

  try {
    const { intent, id, ...recipeData } = data
    const requestPromise = api.put(`v1/recipe/${params.id}`, recipeData)

    toast.promise(requestPromise, {
      loading: "Updating recipe...",
      error: (err) => isAxiosError(err)
        ? err.response?.data?.message || "Something went wrong, please try again later."
        : "Something went wrong, please try again later.",
    })

    const result = await requestPromise

    return {
      success: true,
      intent: "update_recipe",
      id: result.data.id || params.id,
    }
  } catch {
    return {
      success: false,
      intent: "update_recipe",
    }
  }

}

export default function BuildRecipeRoute({ loaderData } : Route.ComponentProps){
    return <BuildRecipe recipe_details={loaderData?.recipeDetails} categories_data={loaderData?.categories || []}/>
}