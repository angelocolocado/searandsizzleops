import AppUserManagement from "~/components/system-settings/user-management/app-user-management";
import api from "~/lib/axios";
import type { Route } from "./+types/user-management";
import { toast } from "sonner";
import axios from "axios";

export async function clientLoader(){
  try{

    const [user] = await Promise.all([
        api.get('user')
    ])

    return {
        current_user: user.data
    }

  } catch (err) {
    return {
        current_user: []
    }
  }
}

export async function clientAction({ request } : Route.ClientActionArgs){
  if(request.method !== "POST") return

  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  switch(data.intent){
    case "update_profile_information": return await handleUpdateUserProfileInformation(data)
  }


}

async function handleUpdateUserProfileInformation(data: any){
  try{
    const requestPromise = api.put('user/profile-information', data)

    toast.promise(requestPromise, {
      loading: "Updating profile information...",
      success: "Profile information has been updated!",
      error: (err) => axios.isAxiosError(err) ? err.response?.data?.message : "Something went wrong..."
    })

    await requestPromise

  } catch(err) { return }
}

export default function UserManagement({ loaderData } : Route.ComponentProps){
    return <AppUserManagement {...loaderData} />
}