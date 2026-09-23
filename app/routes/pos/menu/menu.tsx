import AppMenu from "~/components/pos/menu/app-menu";
import type { Route } from "./+types/menu";
import api from "~/lib/axios";
import { toast } from "sonner";
import { isAxiosError } from "axios";

export function meta({  } : Route.MetaArgs){

}

export async function clientLoader({ request } : Route.ClientLoaderArgs){
    try{
        const [menu_categories, available_recipes, menu_list] = await Promise.all([
            api.get('v1/menu-categories'),
            api.get('v1/recipes?status=available'),
            api.get('v1/menus')
        ])

        return {
            menu_categories: menu_categories.data,
            available_recipes: available_recipes.data,
            menu_list: menu_list.data
        }
    } catch(err) {
        return {
            menu_categories: [],
            available_recipes: [],
            menu_list: []
        }
    }
}

export async function clientAction({ request } : Route.ClientActionArgs){
    if(request.method !== "POST") return

    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    if(data.intent === "add_menu") return await handleAddMenu(data)
}

async function handleAddMenu(data: Record<string, FormDataEntryValue>) {
    try {
        const requestPromise = api.post("v1/menus", data)

        toast.promise(requestPromise, {
            loading: "Adding menu...",
            success: "Menu added successfully!",
            error: (err) => isAxiosError(err)
                ? err.response?.data?.message || "Something went wrong while adding the menu."
                : "Something went wrong while adding the menu.",
        })

        const result = await requestPromise

        return {
            success: true,
            intent: "add_menu",
            data: result.data,
        }
    } catch {
        return {
            success: false,
            intent: "add_menu",
        }
    }

}

export default function Menu({ loaderData } : Route.ComponentProps){
    return <AppMenu categories_data={loaderData.menu_categories} available_recipes={loaderData.available_recipes} menu_list={loaderData.menu_list} />
}