import AppMenu from "~/components/pos/menu/app-menu";
import type { Route } from "../+types/menu";

export function meta({  } : Route.MetaArgs){

}

export async function clientLoader(){

}

export async function clientAction(){

}

export default function Menu(){
    return <AppMenu />
}