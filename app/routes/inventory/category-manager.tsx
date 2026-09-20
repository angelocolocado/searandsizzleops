import api from "~/lib/axios";
import type { Route } from "./+types/category-manager";
import { toast } from "sonner";
import axios, { isAxiosError } from "axios";


export async function clientAction({ request } : Route.ClientActionArgs){

    if(request.method !== "POST") return

    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    switch(data.intent){
        case "delete":
            return await handleDelete(data)
        case "add":
            return await handleAdd(data)
        case "update":
            return await handleUpdate(data)
    }

}

async function handleAdd(data: any){
    try{
        const requestPromise = api.post(`v1/ingredient-categories`, data)

        toast.promise(requestPromise, {
            loading: "Adding category...",
            success: "Success!", 
            error: (err) => {
                if(isAxiosError(err)){
                return err.response?.data?.message || "Something went wrong..."
                }
            }
        })

        await requestPromise
        return {
            success: true,
            intent: "add",
        }
    } catch (err) {
        return {
            success: false,
            intent: "add",
        }
    }
}

async function handleUpdate(data: any){
    try{
        const requestPromise = api.put(`v1/ingredient-categories/${data.id}`, {
            category: data.category,
        })

        toast.promise(requestPromise, {
            loading: "Updating category...",
            success: "Category updated successfully!",
            error: (err) => {
                if(isAxiosError(err)){
                return err.response?.data?.message || "Something went wrong while updating the category."
                }
            }
        })

        await requestPromise

        return {
            success: true,
            intent: "update",
        }
    } catch (err) {
        return {
            success: false,
            intent: "update",
        }
    }
}  

async function handleDelete(data: any){
    try{
        const requestPromise = api.delete(`v1/ingredient-categories/${data.id}`)

        toast.promise(requestPromise, {
            loading: "Removing category...",
            success: "Success!",
            error: (err) => {
                if(isAxiosError(err)){
                return err.response?.data?.message || "Something went wrong while removing the category."
                }
            }
        })

        await requestPromise

        return {
            success: true,
            intent: "delete",
        }
    } catch (err) {
        if(isAxiosError(err)){
            switch(err.response?.status){
                case 409:
                    return {
                        success: false,
                        intent: "delete",
                        itemCount: err.response?.data?.count
                    }
            }
        }
    }
}