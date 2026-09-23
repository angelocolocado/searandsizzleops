import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFetcher } from "react-router"
import z from "zod"
import { CookingPot, FolderOpen, Menu, Plus } from "lucide-react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
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
import { InputGroup, InputGroupAddon, InputGroupInput } from "~/components/ui/input-group"
import { Textarea } from "~/components/ui/textarea"
import { Spinner } from "~/components/ui/spinner"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "~/components/ui/empty"
import type { CategoryDataType } from "~/components/ui/categories-manager"

type AvailableRecipe = {
  id?: string | number
  recipe_id?: string | number
  name?: string
  recipe_name?: string
}

const getRecipeId = (recipe: AvailableRecipe) => recipe.recipe_id ?? recipe.id ?? ""
const getRecipeName = (recipe: AvailableRecipe) => recipe.recipe_name ?? recipe.name ?? "Unnamed recipe"

type ComponentProps = {
  categories_data: CategoryDataType[]
  available_recipes: AvailableRecipe[]
}

const menuSchema = z.object({
  category_id: z.coerce.number().int().min(0, "Select a menu category."),
  recipe_id: z.string().min(1, "Select a recipe."),
  category_name: z.string().min(1, "Select a menu category."),
  recipe_name: z.string().min(1, "Select a recipe."),
  price: z.coerce
    .number()
    .min(0, "Price cannot be negative.")
    .refine((value) => Number.isInteger(value * 100), "Use up to 2 decimal places."),
  description: z.string().trim().min(2, "Description must be at least 2 characters.").max(255, "Description must be under 255 characters.").optional().or(z.literal("")),
  name: z.string().trim().min(2, "Menu name must be at least 2 characters.").max(255, "Menu name must be under 255 characters."),
})

type MenuFormInput = z.input<typeof menuSchema>
type MenuFormValues = z.output<typeof menuSchema>

export function MenuAddMenuPane({ categories_data, available_recipes }: ComponentProps) {
  const [open, setOpen] = useState(false)
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isValid } } = useForm<MenuFormInput, any, MenuFormValues>({
    defaultValues: {
      category_id: "",
      recipe_id: "",
      category_name: "",
      recipe_name: "",
      price: "",
      description: "",
      name: "",
    },
    resolver: zodResolver(menuSchema),
    mode: "onChange",
  })

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success === true && fetcher.data?.intent === "add_menu") {
      reset()
      setOpen(false)
    }
  }, [fetcher.data, fetcher.state, reset])

  const onSubmit = (data: MenuFormValues) => {
    const { category_name, recipe_name, ...menuData } = data

    fetcher.submit(
      {
        ...menuData,
        intent: "add_menu",
      },
      {
        method: "POST",
        action: "/pos/menu",
      }
    )
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus />
        Add menu
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen && !isSubmitting) reset()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add menu item</DialogTitle>
            <DialogDescription>
              Connect an available recipe to a menu category and set its selling price.
            </DialogDescription>
          </DialogHeader>

          <FieldSet disabled={isSubmitting}>
            <form id="add-menu" onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" {...register("category_id")} />
              <input type="hidden" {...register("recipe_id")} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="menu-name">Menu name</FieldLabel>
                  <Input id="menu-name" placeholder="e.g. Chicken Adobo" aria-invalid={Boolean(errors.name)} {...register("name")} />
                  {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="menu-category">Category</FieldLabel>
                    <Select
                        value={watch("category_name")}
                        onValueChange={(value) => {
                          const selected = categories_data.find((category) => category.category === value)
                          setValue("category_name", value ?? "", { shouldValidate: true, shouldDirty: true })
                          setValue("category_id", selected ? String(selected.id) : "", { shouldValidate: true, shouldDirty: true })
                        }}
                    >
                      <SelectTrigger id="menu-category" className="w-full" aria-invalid={Boolean(errors.category_id)}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories_data.length > 0 ? (
                          <SelectGroup>
                            {categories_data.map((category) => (
                              <SelectItem key={category.id} value={category.category}>{category.category}</SelectItem>
                            ))}
                          </SelectGroup>
                        ) : (
                          <Empty className="min-h-32 border-0 p-4">
                            <EmptyHeader>
                              <EmptyMedia variant="icon"><FolderOpen /></EmptyMedia>
                              <EmptyTitle>No menu categories yet</EmptyTitle>
                              <EmptyDescription>Create a menu category first, then return here to select it.</EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.category_id && <FieldError>{errors.category_id.message}</FieldError>}
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="menu-recipe">Recipe</FieldLabel>
                    <Select
                      value={watch("recipe_name")}
                      onValueChange={(value) => {
                        const selected = available_recipes.find((recipe) => getRecipeName(recipe) === value)
                        setValue("recipe_name", value ?? "", { shouldValidate: true, shouldDirty: true })
                        setValue("recipe_id", selected ? String(getRecipeId(selected)) : "", { shouldValidate: true, shouldDirty: true })
                      }}
                    >
                      <SelectTrigger id="menu-recipe" className="w-full" aria-invalid={Boolean(errors.recipe_id)}>
                        <SelectValue placeholder="Select recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        {available_recipes.length > 0 ? (
                          <SelectGroup>
                            {available_recipes.map((recipe) => (
                              <SelectItem key={String(getRecipeId(recipe))} value={getRecipeName(recipe)}>{getRecipeName(recipe)}</SelectItem>
                            ))}
                          </SelectGroup>
                        ) : (
                          <Empty className="min-h-32 border-0 p-4">
                            <EmptyHeader>
                              <EmptyMedia variant="icon"><CookingPot /></EmptyMedia>
                              <EmptyTitle>No available recipes</EmptyTitle>
                              <EmptyDescription>Mark a completed recipe as available before adding it to the menu.</EmptyDescription>
                            </EmptyHeader>
                          </Empty>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.recipe_id && <FieldError>{errors.recipe_id.message}</FieldError>}
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="menu-price">Price</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" className="px-2 text-sm font-medium text-muted-foreground">₱</InputGroupAddon>
                    <InputGroupInput id="menu-price" type="number" min="0" step="0.01" placeholder="0.00" aria-invalid={Boolean(errors.price)} {...register("price", { valueAsNumber: true })} />
                  </InputGroup>
                  <FieldDescription>Set the selling price. Use up to two decimal places.</FieldDescription>
                  {errors.price && <FieldError>{errors.price.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="menu-description">Description <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                  <Textarea id="menu-description" rows={3} placeholder="Describe this menu item for your team." aria-invalid={Boolean(errors.description)} {...register("description")} />
                  {errors.description && <FieldError>{errors.description.message}</FieldError>}
                </Field>
              </FieldGroup>
            </form>
          </FieldSet>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="ghost" disabled={isSubmitting}>Cancel</Button>} />
            <Button type="submit" form="add-menu" disabled={!isValid || isSubmitting}>
              {isSubmitting ? <Spinner /> : <Plus />}
              {isSubmitting ? "Adding menu..." : "Add menu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
