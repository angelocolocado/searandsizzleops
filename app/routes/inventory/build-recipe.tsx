import BuildRecipe from "~/components/inventory/recipe-mapping/manage-recipe/build-recipe";
import type { CategoryDataType } from "~/components/ui/categories-manager";
import type { Route } from "./+types/build-recipe";
import api from "~/lib/axios";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import type { IngredientDataType } from "~/components/inventory/ingredients-stock/ingredient-stock-table/columns";

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
    const [recipeDetails, categories, ingredient_stocks] = await Promise.all([
      api.get(`/v1/recipe/${recipeId}`),
      api.get('/v1/recipe-categories'),
      api.get('/v1/ingredient-stocks')
    ])


    return {
      recipeDetails: recipeDetails.data,
      categories: categories.data as CategoryDataType[],
      ingredient_stocks: ingredient_stocks.data as IngredientDataType[]
    }
  } catch(err) {
    return {
      recipeDetails: null,
      categories: [] as CategoryDataType[],
      ingredient_stocks : [] as IngredientDataType[]
    }
  }

}

export async function clientAction({ request, params } : Route.ClientActionArgs){
  if(request.method !== "POST" || !params.id) return

  const formData = await request.formData()
  const data = Object.fromEntries(formData)


  if(data.intent === "add_recipe_ingredient") return await handleAddRecipeIngredient(data)
  else if(data.intent === "update_recipe_ingredient") return await handleUpdateRecipeIngredient(data)
  else if(data.intent === "delete_recipe_ingredient") return await handleDeleteRecipeIngredient(data)
  else if(data.intent === "publish_recipe") return await handlePublishRecipe(params.id, data)
  else if(data.intent === "unpublish_recipe") return await handlePublishRecipe(params.id, data)

    
}


async function handlePublishRecipe(params: any, data: any) {
  try{
    const requestPromise = api.put(`v1/recipe/${params}/publish`, data)

    toast.promise(requestPromise, {
      loading: data.intent === "unpublish_recipe" ? "Marking recipe unavailable..." : "Publishing Recipe...",
      success: data.intent === "unpublish_recipe" ? "Recipe marked as unavailable." : "Recipe published!",
      error: (err) => {
        if(isAxiosError(err)){
          return err.response?.data?.message || "Something went wrong, Please try again later."
        }
      }
    })

    const result = await requestPromise

    return {
      success: true,
      intent: data.intent,
      id: result.data.id || data.id
    }
  } catch(err) {
    return {
      success: false,
      intent: data.intent
    }
  }
}

async function handleAddRecipeIngredient(data: any){
  try{
    const requestPromise = api.post('/v1/recipe', data)

    toast.promise(requestPromise, {
      loading: "Adding recipe ingredient...",
      success: "Recipe ingredient added!",
      error: (err) => isAxiosError(err) 
        ? err.response?.data?.message || "Something went wrong while adding the recipe ingredient."
        : "Something went wrong while adding the recipe ingredient.",
    })

    await requestPromise

    return {
      success: true,
      intent: "add_recipe_ingredient"
    }
  } catch(err) {
    return {
      success: false,
      intent: "add_recipe_ingredient"
    }
  }
}

async function handleUpdateRecipeIngredient(data: any){
  
  try{
    const requestPromise = api.put(`/v1/recipe/${data.id}`, data)

    toast.promise(requestPromise, {
      loading: "Updating recipe ingredient...",
      success: "Recipe ingredient updated successfully!",
      error: (err) => isAxiosError(err)
        ? err.response?.data?.message || "Something went wrong while updating the recipe ingredient."
        : "Something went wrong while updating the recipe ingredient.",
    })

    await requestPromise

    return {
      success: true,
      intent: "update_recipe_ingredient",
    }
  } catch {
    return {
      success: false,
      intent: "update_recipe_ingredient",
    }
  }
}

async function handleDeleteRecipeIngredient(data: any){
  try{
    const requestPromise = api.delete(`/v1/recipe/${data.id}`)

    toast.promise(requestPromise, {
      loading: "Deleting recipe ingredient...",
      success: "Recipe ingredient deleted successfully!",
      error: (err) => isAxiosError(err)
        ? err.response?.data?.message || "Something went wrong while deleting the recipe ingredient."
        : "Something went wrong while deleting the recipe ingredient.",
    })

    await requestPromise

    return {
      success: true,
      intent: "delete_recipe_ingredient",
    }
  } catch {
    return {
      success: false,
      intent: "delete_recipe_ingredient",
    }
  }
}

export default function BuildRecipeRoute({ loaderData } : Route.ComponentProps){
    return <BuildRecipe recipe_details={loaderData?.recipeDetails} categories_data={loaderData?.categories || []} ingredient_data={loaderData?.ingredient_stocks || []}/>
}