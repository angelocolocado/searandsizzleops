
import { useEffect } from "react"
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
import { Textarea } from "~/components/ui/textarea"
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
        .min(1, "Recipe Category is invalid"),

    yield_quantity: z.coerce
        .number()
        .int("Yield quantity must be a whole number")
        .min(1, "Yield quantity must be at least 1"),

    yield_unit: z
        .string()
        .trim()
        .min(1, "Yield unit is required")
        .max(30, "Yield unit must be under 30 characters"),

    notes: z
        .string()
        .max(1000, "Notes must be under 1000 characters")
        .optional(),

    custom_yield_unit: z
        .string()
        .trim()
        .max(30, "Yield unit must be under 30 characters")
        .optional(),
}).superRefine((data, context) => {
    if (data.yield_unit === "custom" && !data.custom_yield_unit) {
        context.addIssue({
            code: "custom",
            path: ["custom_yield_unit"],
            message: "Custom yield unit is required",
        })
    }
})

    type FormSchemaType = z.output<typeof formSchema>
    type FormInputType = z.input<typeof formSchema>

type ComponentProps = {
    categories_data: CategoryDataType[]
    recipe_details?: {
        recipe_id: string
        recipe_name: string
        category: string
        yield_quantity: number
        yield_unit: string
        notes?: string | null
    } | null
    mode?: "create" | "edit"
    actionPath?: string
    onSuccess?: () => void
}

const yieldUnits = ["serving", "piece", "portion", "bowl", "plate", "glass"]

export function SetupRecipeDialog({
    categories_data,
    recipe_details,
    mode = "create",
    actionPath = "/inventory/recipes",
    onSuccess,
}: ComponentProps){

    const navigate = useNavigate()
    const fetcher = useFetcher()

    useEffect(() => {
        if (
            fetcher.data?.success === true &&
            fetcher.data?.intent === `${mode}_recipe` &&
            fetcher.data?.id
        ) {
            if (mode === "create") {
                navigate(`/inventory/recipes/${fetcher.data.id}`)
            } else {
                onSuccess?.()
            }
        }
    }, [fetcher.data, mode, navigate, onSuccess])

    const resetFormValues = recipe_details
        ? {
            recipe_name: recipe_details.recipe_name,
            category: recipe_details.category,
            yield_quantity: String(recipe_details.yield_quantity),
            yield_unit: yieldUnits.includes(recipe_details.yield_unit) ? recipe_details.yield_unit : "custom",
            notes: recipe_details.notes || "",
            custom_yield_unit: yieldUnits.includes(recipe_details.yield_unit) ? "" : recipe_details.yield_unit,
        }
        : {
            recipe_name: "",
            category: "",
            yield_quantity: "",
            yield_unit: "serving",
            notes: "",
            custom_yield_unit: "",
        }

    const { register, handleSubmit, watch, setValue, reset, formState: { isSubmitting, errors, isValid } } =  useForm<FormInputType, any, FormSchemaType>({
        defaultValues: resetFormValues,
        resolver: zodResolver(formSchema),
        mode: "onChange"
    })

    useEffect(() => {
        reset(resetFormValues)
    }, [recipe_details, reset])

    const onSubmit = (data: FormSchemaType) => {
        const { custom_yield_unit, ...recipeData } = data

        fetcher.submit({
            ...recipeData,
            yield_unit: data.yield_unit === "custom" ? custom_yield_unit?.trim() || "" : data.yield_unit,
            intent: `${mode}_recipe`,
            ...(mode === "edit" && recipe_details?.recipe_id ? { id: recipe_details.recipe_id } : {}),
        },
        {
            method: "POST",
            action: actionPath
        })
    }

    return (<>
    
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{mode === "edit" ? "Edit recipe details" : "Set up your recipe"}</DialogTitle>
                <DialogDescription>
                {mode === "edit"
                    ? "Update the details used to identify this recipe and deduct ingredients in POS."
                    : "Add the basic details for this recipe. The yield tells POS how many units one recipe produces so it can deduct the right amount of ingredients per sale."}
                </DialogDescription>
            </DialogHeader>
            <FieldSet className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-amber-500 hover:scrollbar-thumb-amber-600 scrollbar-gutter-stable" disabled={isSubmitting || fetcher.state !== "idle"}>
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

                        <div className="grid gap-5 sm:grid-cols-2">
                            <Field>
                                <FieldLabel htmlFor="yield_quantity">Yield quantity</FieldLabel>
                                <Input
                                    id="yield_quantity"
                                    type="number"
                                    min="1"
                                    step="1"
                                    placeholder="e.g. 2"
                                    aria-invalid={Boolean(errors.yield_quantity)}
                                    {...register("yield_quantity", { valueAsNumber: true })}
                                />
                                <FieldDescription>Number of units produced by one recipe.</FieldDescription>
                                {errors.yield_quantity && <FieldError>{errors.yield_quantity.message}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="yield_unit">Yield unit</FieldLabel>
                                <Select
                                    value={watch("yield_unit")}
                                    onValueChange={(value) => setValue("yield_unit", value ?? "", {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    })}
                                >
                                    <SelectTrigger id="yield_unit" className="w-full" aria-invalid={Boolean(errors.yield_unit)}>
                                        <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="serving">Serving</SelectItem>
                                            <SelectItem value="piece">Piece</SelectItem>
                                            <SelectItem value="portion">Portion</SelectItem>
                                            <SelectItem value="bowl">Bowl</SelectItem>
                                            <SelectItem value="plate">Plate</SelectItem>
                                            <SelectItem value="glass">Glass</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <FieldDescription>Unit sold or served for each POS deduction.</FieldDescription>
                                {errors.yield_unit && <FieldError>{errors.yield_unit.message}</FieldError>}
                            </Field>
                        </div>

                        {watch("yield_unit") === "custom" && (
                            <Field>
                                <FieldLabel htmlFor="custom_yield_unit">Custom yield unit</FieldLabel>
                                <Input
                                    id="custom_yield_unit"
                                    placeholder="e.g. tub"
                                    aria-invalid={Boolean(errors.custom_yield_unit)}
                                    {...register("custom_yield_unit", {
                                        required: "Custom yield unit is required",
                                    })}
                                />
                                <FieldDescription>Enter the unit used when this recipe is sold.</FieldDescription>
                                {errors.custom_yield_unit && <FieldError>{errors.custom_yield_unit.message}</FieldError>}
                            </Field>
                        )}

                        <Field>
                            <FieldLabel htmlFor="notes">Notes</FieldLabel>
                            <Textarea
                                id="notes"
                                placeholder="Add preparation notes, serving details, or other helpful context."
                                rows={3}
                                aria-invalid={Boolean(errors.notes)}
                                {...register("notes")}
                            />
                            <FieldDescription>Optional. You can update this later.</FieldDescription>
                            {errors.notes && <FieldError>{errors.notes.message}</FieldError>}
                        </Field>
                    </FieldGroup>
                </form>
            </FieldSet>
            <DialogFooter>
                <DialogClose render={<Button disabled={isSubmitting || fetcher.state !== "idle"} type="reset" form="setup_recipe" variant="ghost">Cancel</Button>} />
            <Button className="min-w-15" disabled={isSubmitting || fetcher.state !== "idle" || !isValid} type="submit" form="setup_recipe">
                {(isSubmitting || fetcher.state !== "idle") ? <Spinner /> : mode === "edit" ? "Save changes" : "Next"}
            </Button>
            </DialogFooter>
        </DialogContent>

    </>)
}