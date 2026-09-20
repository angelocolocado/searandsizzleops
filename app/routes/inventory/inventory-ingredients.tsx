import api from "~/lib/axios";
import type { Route } from "./+types/inventory-ingredients";
import { IngredientsStock } from "~/components/inventory/ingredients-stock/ingredients-stock";
import { toast } from "sonner";
import axios, { isAxiosError } from "axios";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sear Sizzling QC | Admin - Inventory Ingredients" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function clientLoader() {
  try{
    const categories = await api.get("v1/ingredient-categories")
    const ingredients = await api.get("/v1/ingredient-stocks")

    return {
      categories: categories.data,
      ingredients: ingredients.data
    }

  } catch (err) {
    return {
      categories: [],
      ingredients: [],
    };
  }
}


export async function clientAction({ request } : Route.ClientActionArgs){

  if(request.method === "POST"){
    const formData = await request.json();

    switch(formData.intent){
      case "POST":
        return await addIngredient(formData)
      case "UPDATE":
        return await updateIngredient(formData)
    }
  } 

  if(request.method === "DELETE"){
    const formData = await request.formData()

    if(formData.get('id')) return await deleteIngredient(formData.get('id'))
    
  }

  

}

async function updateIngredient(formData: any){
    try{
      const requestPromise = api.put(`v1/ingredient-stocks/${formData.id}`, formData)

      toast.promise(requestPromise, {
        loading: "Updating Ingredient...",
        success: "Ingredient Updated!",
        error: (err) => {
          if(isAxiosError(err)){
            return err.response?.data?.message || "Something went wrong..."
          }
        }
      })

      const response = await requestPromise

      return {
        success: true,
        intent: formData.intent,
        data: response.data,
      }
    } catch(err) {
      if(isAxiosError(err)){
        console.log(err)
      }

      return {
        success: false,
        intent: formData.intent,
      }
    }
}

async function addIngredient(formData: any){
    try{
      const requestPromise = api.post('v1/ingredient-stocks', formData)

      toast.promise(requestPromise, {
        loading: "Adding Ingredient...",
        success: "Ingredient Added!",
        error: (err) => {
          if(isAxiosError(err)){
            return err.response?.data?.message || "Something went wrong..."
          }
        }
      })

      const response = await requestPromise

      return {
        success: true,
        intent: formData.intent,
        data: response.data,
      }
    } catch(err) {
      if(isAxiosError(err)){
        console.log(err)
      }

      return {
        success: false,
        intent: formData.intent,
      }
    }
}

async function deleteIngredient(id: any){
  try{
      const requestPromise = api.delete(`v1/ingredient-stocks/${id}`)

      toast.promise(requestPromise, {
        loading: "Deleting Ingredient...",
        success: "Ingredient Deleted!",
        error: (err) => {
          if(isAxiosError(err)){
            return err.response?.data?.message || "Something went wrong..."
          }
        }
      })

      await requestPromise
    } catch(err) {
      if(isAxiosError(err)){
        console.log(err)
      }
    }
}

export default function Home({ loaderData } : Route.ComponentProps) {
  return <IngredientsStock 
            ingredients_data={loaderData.ingredients}
            categories_data={loaderData.categories}
          />
}