import AppMenu from "~/components/pos/menu/app-menu";
import type { Route } from "./+types/menu";
import api from "~/lib/axios";

export function meta({  } : Route.MetaArgs){

}

export async function clientLoader({ request } : Route.ClientLoaderArgs){
    try{
        const [menu_categories, ] = await Promise.all([
            api.get('v1/menu-categories')
        ])

        return {
            menu_categories: menu_categories.data
        }
    } catch(err) {
        return {
            menu_categories: []
        }
    }
}

export async function clientAction(){

}

export default function Menu({ loaderData } : Route.ComponentProps){
    return <AppMenu categories_data={loaderData.menu_categories} />
}