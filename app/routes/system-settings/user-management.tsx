import AppUserManagement from "~/components/system-settings/user-management/app-user-management";
import api from "~/lib/axios";
import type { Route } from "./+types/user-management";

export async function clientLoader(){
  try{

    const [user] = await Promise.all([
        api.get('user')
    ])

    return {
        current_user: user
    }

  } catch (err) {
    return {
        current_user: []
    }
  }
}

export default function UserManagement({ loaderData } : Route.ComponentProps){
    return <AppUserManagement {...loaderData} />
}