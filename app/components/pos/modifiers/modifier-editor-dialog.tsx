import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Save } from "lucide-react"
import { useFetcher } from "react-router"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { Spinner } from "~/components/ui/spinner"
import type { Modifier, ModifierCategory, ModifierRecipe } from "./modifier-types"

const modifierSchema = z.object({
  category_id: z.string().min(1, "Choose a modifier category.").refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, "Choose a modifier category."),
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120, "Name must be under 120 characters."),
  price: z.string().trim().min(1, "Enter a price.").refine((value) => {
    const amount = Number(value)
    return Number.isFinite(amount) && amount >= 0 && Number(amount.toFixed(2)) === amount
  }, "Enter a nonnegative price with up to two decimal places."),
  recipe_id: z.string(),
  description: z.string().trim().max(255, "Description must be under 255 characters."),
})

type ModifierFormValues = z.infer<typeof modifierSchema>

type ComponentProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: ModifierCategory[]
  recipes: ModifierRecipe[]
  modifier?: Modifier | null
}

const getRecipeId = (recipe: ModifierRecipe) => recipe.recipe_id ?? recipe.id ?? ""
const getRecipeName = (recipe: ModifierRecipe) => recipe.recipe_name ?? recipe.name ?? "Recipe"

export function ModifierEditorDialog({ open, onOpenChange, categories, recipes, modifier }: ComponentProps) {
  const fetcher = useFetcher()
  const isSaving = fetcher.state !== "idle"
  const isEditing = Boolean(modifier)
  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isValid } } = useForm<ModifierFormValues>({
    resolver: zodResolver(modifierSchema),
    mode: "onChange",
    defaultValues: { category_id: "", name: "", price: "", recipe_id: "", description: "" },
  })

  useEffect(() => {
    reset({
      category_id: modifier ? String(modifier.category_id) : "",
      name: modifier?.name ?? "",
      price: modifier ? String(modifier.price) : "",
      recipe_id: modifier?.recipe_id ?? "",
      description: modifier?.description ?? "",
    })
  }, [modifier, open, reset])

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && fetcher.data?.intent === (isEditing ? "update_modifier" : "create_modifier")) {
      onOpenChange(false)
    }
  }, [fetcher.data, fetcher.state, isEditing, onOpenChange])

  const onSubmit = (values: ModifierFormValues) => {
    fetcher.submit({
      intent: isEditing ? "update_modifier" : "create_modifier",
      ...(modifier ? { modifier_id: modifier.id } : {}),
      category_id: Number(values.category_id),
      name: values.name.trim(),
      price: Number(values.price),
      recipe_id: values.recipe_id,
      description: values.description.trim(),
    }, { method: "post", action: "/pos/modifiers" })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit modifier" : "Create modifier"}</DialogTitle>
          <DialogDescription>{isEditing ? "Update this option's details and recipe link." : "Add an optional item customers can choose with a menu item."}</DialogDescription>
        </DialogHeader>

        <form id="modifier-editor" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldContent>
                <FieldLabel htmlFor="modifier-name">Name</FieldLabel>
                <Input id="modifier-name" placeholder="e.g. Extra cheese" maxLength={120} aria-invalid={Boolean(errors.name)} {...register("name")} />
                {errors.name && <FieldError>{errors.name.message}</FieldError>}
              </FieldContent>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldContent>
                  <FieldLabel htmlFor="modifier-category">Category</FieldLabel>
                  <input type="hidden" {...register("category_id")} />
                  <Select value={watch("category_id")} onValueChange={(value) => setValue("category_id", value ?? "", { shouldValidate: true, shouldDirty: true })}>
                    <SelectTrigger id="modifier-category" className="w-full" aria-invalid={Boolean(errors.category_id)}>
                      <SelectValue>{categories.find((category) => String(category.id) === watch("category_id"))?.category ?? "Select category"}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {categories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.category}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.category_id && <FieldError>{errors.category_id.message}</FieldError>}
                </FieldContent>
              </Field>

              <Field>
                <FieldContent>
                  <FieldLabel htmlFor="modifier-price">Price</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start">₱</InputGroupAddon>
                    <InputGroupInput id="modifier-price" type="number" min="0" step="0.01" placeholder="0.00" aria-invalid={Boolean(errors.price)} {...register("price")} />
                  </InputGroup>
                  {errors.price && <FieldError>{errors.price.message}</FieldError>}
                </FieldContent>
              </Field>
            </div>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="modifier-recipe">Recipe <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                <input type="hidden" {...register("recipe_id")} />
                <Select value={watch("recipe_id") || "none"} onValueChange={(value) => setValue("recipe_id", value === "none" ? "" : value ?? "", { shouldDirty: true })}>
                  <SelectTrigger id="modifier-recipe" className="w-full">
                    <SelectValue>{recipes.find((recipe) => String(getRecipeId(recipe)) === watch("recipe_id")) ? getRecipeName(recipes.find((recipe) => String(getRecipeId(recipe)) === watch("recipe_id"))!) : "No linked recipe"}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="none">No linked recipe</SelectItem>
                      {recipes.map((recipe) => {
                        const id = getRecipeId(recipe)
                        return id ? <SelectItem key={String(id)} value={String(id)}>{getRecipeName(recipe)}</SelectItem> : null
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Link a recipe if this modifier represents a prepared item.</FieldDescription>
              </FieldContent>
            </Field>

            <Field>
              <FieldContent>
                <FieldLabel htmlFor="modifier-description">Description <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                <Textarea id="modifier-description" rows={3} maxLength={255} placeholder="Add a short note for staff." aria-invalid={Boolean(errors.description)} {...register("description")} />
                {errors.description && <FieldError>{errors.description.message}</FieldError>}
              </FieldContent>
            </Field>
          </FieldGroup>
        </form>

        <DialogFooter>
          <DialogClose render={<Button type="button" variant="ghost" disabled={isSaving}>Cancel</Button>} />
          <Button type="submit" form="modifier-editor" disabled={!isValid || isSaving}>
            {isSaving ? <Spinner /> : isEditing ? <Save /> : <Plus />}
            {isSaving ? "Saving..." : isEditing ? "Save modifier" : "Create modifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}