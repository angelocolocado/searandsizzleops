
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "~/components/ui/button"
import {
    DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "~/components/ui/field"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

import { Input } from "~/components/ui/input"
import type { CategoryDataType } from "../categories-manager"
import { Plus } from "lucide-react"
import { useFetcher, useNavigate } from "react-router"
import { Spinner } from "~/components/ui/spinner"

const formSchema = z.object({
    recipe_name: z
        .string()
        .min(2, 'Recipe Name must have atleast 2 characters'),

    category: z
        .string()
        .min(1, "Recipe Category is invalid")
})

type FormSchemaType = z.infer<typeof formSchema>

type ComponentProps = {
    categories_data: CategoryDataType[]
}

export function SetupRecipeDialog({ categories_data } : ComponentProps){

    const navigate = useNavigate()
    const fetcher = useFetcher()

    const { register, handleSubmit, watch, setValue, formState: { isSubmitting, errors, isValid } } =  useForm<FormSchemaType>({
        defaultValues: {
            recipe_name: "",
            category: ""
        },
        resolver: zodResolver(formSchema),
        mode: "onChange"
    })

    const onSubmit = (data: FormSchemaType) => {
        fetcher.submit({
            ...data,
            intent: "setup_recipe"
        },
        {
            method: "POST",
            action: "/inventory/recipes"
        })
    }

    return (<>
    
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                This action cannot be undone. This will permanently delete your account
                and remove your data from our servers.
                </DialogDescription>
            </DialogHeader>
            <FieldSet disabled={isSubmitting || fetcher.state !== "idle"}>
                <form id="setup_recipe" onSubmit={handleSubmit(onSubmit)}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel>Recipe Name</FieldLabel>
                            <Input
                                placeholder="e.g. Adobo"
                                {...register('recipe_name')}
                            />
                            {errors.recipe_name && <FieldError>{errors.recipe_name.message}</FieldError>} 
                        </Field>

                        <Field>
                            <FieldLabel>Recipe Category</FieldLabel>
                            <Select
                                value={watch("category")}
                                onValueChange={(value) => setValue("category", value ?? "", {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                })}
                            >
                                <SelectTrigger id="category" className="w-full">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    {categories_data.length > 0 ? (
                                        categories_data.map((c) => (
                                        <SelectItem key={c.id} value={c.category}>
                                            {c.category}
                                        </SelectItem>
                                        ))
                                    ) : (
                                        <div className="flex w-full flex-col items-center px-4 py-5 text-center">
                                            <p className="text-sm font-medium text-foreground">No categories yet</p>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Create a category first to start mapping recipes.</p>
                                            <DialogClose render={
                                                <Button type="button" size="xs" className="mt-2" onClick={() => navigate("/inventory/recipes#categories-manager")}><Plus className="size-3.5" />Add category</Button>
                                            } />
                                            
                                        </div>
                                    )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {errors.category && <FieldError>{errors.category.message}</FieldError>}
                        </Field>
                    </FieldGroup>
                </form>
            </FieldSet>
            <DialogFooter>
                <DialogClose render={<Button disabled={isSubmitting || fetcher.state !== "idle"} type="reset" form="setup_recipe" variant="ghost">Cancel</Button>} />
            <Button className="min-w-15" disabled={isSubmitting || fetcher.state !== "idle" || !isValid} type="submit" form="setup_recipe">
                {(isSubmitting || fetcher.state !== "idle") ? <Spinner /> : 'Next'}
            </Button>
            </DialogFooter>
        </DialogContent>

    </>)
}