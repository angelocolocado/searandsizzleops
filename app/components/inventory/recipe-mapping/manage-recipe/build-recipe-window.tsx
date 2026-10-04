import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFetcher, useRevalidator } from "react-router"
import z from "zod"
import { Check, ChevronRight, Clock3, Pencil, Blender, Trash2, X } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
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
import { Spinner } from "~/components/ui/spinner"
import type { IngredientDataType } from "../../ingredients-stock/ingredient-stock-table/columns"
import type { RecipeIngredientType } from "./header"
import { unitOptions } from "~/utils/uom"

type ComponentProps = {
    recipe_id?: string
    ingredient_data: IngredientDataType[]
    recipe_ingredients: RecipeIngredientType[]
    isActive: boolean
}

const formSchema = z.object({
    recipe_id: z.string().min(1, "Recipe is required"),
    recipe_ingredient_id: z.string().min(1, "Select an ingredient"),
    ingredient_name: z.string().min(1, "Select an ingredient"),
    quantity: z.coerce
        .number()
        .positive("Quantity must be greater than 0")
        .max(9999999.999, "Quantity is too large")
        .refine((value) => Number.isInteger(value * 1000), "Use up to 3 decimal places"),
    unit: z.enum(unitOptions),
})

type FormInputType = z.input<typeof formSchema>
type FormSchemaType = z.output<typeof formSchema>

const formatDate = (date?: string) => {
    if (!date) return "Recently added"

    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) return "Recently added"

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

export function BuildRecipeWindow({ isActive, recipe_id, ingredient_data, recipe_ingredients } : ComponentProps){
    const fetcher = useFetcher()
    const { revalidate } = useRevalidator()
    const [editingId, setEditingId] = useState<string | null>(null)
    const handledResponseRef = useRef<object | null>(null)
    const isSubmitting = fetcher.state !== "idle"

    const { register, handleSubmit, watch, setValue, reset, formState: { errors, isValid } } = useForm<FormInputType, any, FormSchemaType>({
        defaultValues: {
            recipe_id: recipe_id || "",
            recipe_ingredient_id: "",
            ingredient_name: "",
            quantity: "",
            unit: "pcs",
        },
        resolver: zodResolver(formSchema),
        mode: "onChange",
    })

    useEffect(() => {
        setValue("recipe_id", recipe_id || "", { shouldValidate: true })
    }, [recipe_id, setValue])

    const selectedIngredientName = watch("ingredient_name")
    const selectedIngredient = ingredient_data.find(
        (ingredient) => ingredient.item_name === selectedIngredientName
    )

    const resetIngredientForm = () => {
        setEditingId(null)
        reset({
            recipe_id: recipe_id || "",
            recipe_ingredient_id: "",
            ingredient_name: "",
            quantity: "",
            unit: "pcs",
        })
    }

    const handleEdit = (ingredient: RecipeIngredientType) => {
        if (isActive) return

        const stockIngredient = ingredient_data.find(
            (stock) => stock.item_name === ingredient.recipe_name
        )

        setEditingId(String(ingredient.id))
        reset({
            recipe_id: recipe_id || "",
            recipe_ingredient_id: stockIngredient ? String(stockIngredient.id) : "",
            ingredient_name: ingredient.recipe_name,
            quantity: ingredient.quantity,
            unit: ingredient.unit as FormInputType["unit"],
        })
    }

    const handleDelete = (ingredientId: string) => {
        fetcher.submit(
            {
                intent: "delete_recipe_ingredient",
                id: ingredientId,
                recipe_id: recipe_id || "",
            },
            {
                method: "POST",
                action: `/inventory/recipes/${recipe_id || ""}`,
            }
        )
    }

    const onSubmit = (data: FormSchemaType) => {
        if (isActive) return

        const { ingredient_name, ...ingredientData } = data

        fetcher.submit(
            {
                ...ingredientData,
                quantity: String(data.quantity),
                intent: editingId ? "update_recipe_ingredient" : "add_recipe_ingredient",
                ...(editingId ? { id: editingId } : {}),
            },
            {
                method: "POST",
                action: `/inventory/recipes/${recipe_id || ""}`,
            }
        )
    }

    useEffect(() => {
        if (
            fetcher.data &&
            fetcher.data !== handledResponseRef.current &&
            fetcher.data?.success === true &&
            ["add_recipe_ingredient", "update_recipe_ingredient", "delete_recipe_ingredient"].includes(fetcher.data?.intent)
        ) {
            handledResponseRef.current = fetcher.data
            resetIngredientForm()
            revalidate()
        }
    }, [fetcher.data, revalidate])

    return (
        <section className="mt-5 overflow-hidden rounded-2xl border bg-card shadow-sm">
            <div className="border-b px-5 py-5 sm:px-7">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">Recipe composition</p>
                        <h2 className="mt-1 text-lg font-semibold tracking-tight">Current ingredients</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Ingredients deducted from stock whenever this recipe is produced.
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {recipe_ingredients.length} {recipe_ingredients.length === 1 ? "ingredient" : "ingredients"}
                    </span>
                </div>

                {recipe_ingredients.length > 0 ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {recipe_ingredients.map((ingredient) => (
                            <article
                                key={ingredient.id}
                                className="group rounded-xl border bg-muted/20 p-3.5 transition-colors hover:bg-muted/40"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-medium text-foreground" title={ingredient.recipe_name}>
                                            {ingredient.recipe_name}
                                        </h3>
                                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                                            <Clock3 className="size-3" />
                                            Added {formatDate(ingredient.updated_at)}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            title="Update ingredient"
                                            aria-label={`Update ${ingredient.recipe_name}`}
                                            disabled={isActive || isSubmitting}
                                            onClick={() => handleEdit(ingredient)}
                                        >
                                            <Pencil />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            title="Delete ingredient"
                                            aria-label={`Delete ${ingredient.recipe_name}`}
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(String(ingredient.id))}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-end justify-between gap-3">
                                    <p className="text-[11px] text-muted-foreground">Used per recipe output</p>
                                    <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                        {ingredient.quantity} {ingredient.unit}
                                    </span>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed bg-muted/10 px-5 py-8 text-center">
                        <p className="text-sm font-medium text-foreground">No ingredients mapped yet</p>
                        <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                            Add the first ingredient below to start building this recipe.
                        </p>
                    </div>
                )}
            </div>

            <div className="border-b bg-muted/20 px-5 py-4 sm:px-7">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Blender className="size-4" />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold tracking-tight">
                            {editingId ? "Update recipe ingredient" : "Build recipe ingredients"}
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {editingId
                                ? "Update the quantity or unit, then save the ingredient changes."
                                : isActive
                                    ? "This recipe is available in POS. Ingredient changes are locked until it is unavailable."
                                    : "Add ingredients individually with the quantity used for one recipe output."}
                        </p>
                    </div>
                </div>
            </div>

            <FieldSet disabled={isActive || isSubmitting || !recipe_id} className="px-5 py-5 sm:px-7">
                <fetcher.Form id="add_recipe_ingredient" onSubmit={handleSubmit(onSubmit)}>
                    <input type="hidden" {...register("recipe_id")} />
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="ingredient_name">Ingredient stock</FieldLabel>
                            <Select
                                value={selectedIngredientName}
                                onValueChange={(value) => {
                                    const selected = ingredient_data.find(
                                        (ingredient) => ingredient.item_name === value
                                    )

                                    setValue("ingredient_name", value ?? "", {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    })
                                    setValue("recipe_ingredient_id", selected ? String(selected.id) : "", {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    })
                                }}
                            >
                                <SelectTrigger id="ingredient_name" className="w-full" aria-invalid={Boolean(errors.recipe_ingredient_id)}>
                                    <SelectValue placeholder="Select an ingredient" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {ingredient_data.length > 0 ? ingredient_data.map((ingredient) => (
                                            <SelectItem key={ingredient.id} value={ingredient.item_name}>
                                                <span className="flex min-w-0 items-center justify-between gap-3">
                                                    <span className="truncate">{ingredient.item_name}</span>
                                                    <span className="text-xs text-muted-foreground">{ingredient.quantity} {ingredient.unit}</span>
                                                </span>
                                            </SelectItem>
                                        )) : (
                                            <div className="px-3 py-5 text-center text-sm text-muted-foreground">
                                                No ingredient stock available.
                                            </div>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            <input type="hidden" {...register("recipe_ingredient_id")} />
                            {selectedIngredient && (
                                <FieldDescription>
                                    Current stock: {selectedIngredient.quantity} {selectedIngredient.unit}
                                </FieldDescription>
                            )}
                            {errors.recipe_ingredient_id && <FieldError>{errors.recipe_ingredient_id.message}</FieldError>}
                        </Field>

                        <div className="grid gap-5 sm:grid-cols-[1fr_0.8fr]">
                            <Field>
                                <FieldLabel htmlFor="quantity">Quantity used for this recipe</FieldLabel>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="0.001"
                                    step="0.001"
                                    placeholder="e.g. 250"
                                    aria-invalid={Boolean(errors.quantity)}
                                    {...register("quantity", { valueAsNumber: true })}
                                />
                                <FieldDescription>Amount consumed when one recipe output is produced.</FieldDescription>
                                {errors.quantity && <FieldError>{errors.quantity.message}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="unit">Usage unit</FieldLabel>
                                <Select
                                    value={watch("unit")}
                                    onValueChange={(value) => setValue("unit", value as FormInputType["unit"], {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    })}
                                >
                                    <SelectTrigger id="unit" className="w-full" aria-invalid={Boolean(errors.unit)}>
                                        <SelectValue placeholder="Select a unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {unitOptions.map((unit) => (
                                                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                {errors.unit && <FieldError>{errors.unit.message}</FieldError>}
                            </Field>
                        </div>
                    </FieldGroup>

                    <div className="mt-5 flex justify-end">
                        <Button type="submit" disabled={!isValid || isSubmitting || !recipe_id || ingredient_data.length === 0}>
                            {isSubmitting ? <Spinner /> : <Check />}
                            {isSubmitting ? editingId ? "Saving changes..." : "Adding ingredient..." : editingId ? "Save changes" : "Add ingredient"}
                            {!isSubmitting && <ChevronRight />}
                        </Button>
                        {editingId && (
                            <Button type="button" variant="ghost" disabled={isSubmitting} onClick={resetIngredientForm}>
                                <X />
                                Cancel
                            </Button>
                        )}
                    </div>
                </fetcher.Form>
            </FieldSet>
        </section>
    )
}