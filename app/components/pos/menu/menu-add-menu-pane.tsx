import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFetcher } from "react-router"
import z from "zod"
import { FolderOpen, Plus } from "lucide-react"
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

type ComponentProps = {
  categories_data: CategoryDataType[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

const menuSchema = z.object({
  category_id: z.coerce.number().int().min(1, "Select a menu category."),
  selling_price: z.union([
    z.literal(""),
    z.coerce.number()
      .min(0, "Selling price cannot be negative.")
      .refine((value) => Number(value.toFixed(2)) === value, "Use up to 2 decimal places."),
  ]).transform((value) => value === "" ? null : value),
  description: z.string()
    .trim()
    .max(255, "Description must be under 255 characters.")
    .refine((value) => value.length === 0 || value.length >= 2, "Description must be at least 2 characters.")
    .transform((value) => value || null),
  name: z.string().trim().min(2, "Menu name must be at least 2 characters.").max(255, "Menu name must be under 255 characters."),
})

type MenuFormInput = z.input<typeof menuSchema>
type MenuFormValues = z.output<typeof menuSchema>

export function MenuAddMenuPane({ categories_data, open, onOpenChange }: ComponentProps) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== "idle"

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isValid } } = useForm<MenuFormInput, any, MenuFormValues>({
    defaultValues: {
      category_id: "",
      selling_price: "",
      description: "",
      name: "",
    },
    resolver: zodResolver(menuSchema),
    mode: "onChange",
  })

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success === true && fetcher.data?.intent === "add_menu") {
      reset()
      onOpenChange(false)
    }
  }, [fetcher.data, fetcher.state, onOpenChange, reset])

  const onSubmit = (data: MenuFormValues) => {
    const { selling_price, description, ...menuData } = data

    fetcher.submit(
      {
        ...menuData,
        ...(selling_price !== null ? { profit: selling_price } : {}),
        ...(description !== null ? { description } : {}),
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
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          onOpenChange(nextOpen)
          if (!nextOpen && !isSubmitting) reset()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add menu item</DialogTitle>
            <DialogDescription>
              Create the menu item first. You can add its recipe and modifiers, then set or update its selling price.
            </DialogDescription>
          </DialogHeader>

          <FieldSet disabled={isSubmitting}>
            <form id="add-menu" onSubmit={handleSubmit(onSubmit)}>
              <input type="hidden" {...register("category_id")} />
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="menu-name">Menu name</FieldLabel>
                  <Input id="menu-name" placeholder="e.g. Chicken Adobo" aria-invalid={Boolean(errors.name)} {...register("name")} />
                  {errors.name && <FieldError>{errors.name.message}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="menu-category">Category</FieldLabel>
                  <Select
                    value={watch("category_id") ? String(watch("category_id")) : ""}
                    onValueChange={(value) => setValue("category_id", value ?? "", { shouldValidate: true, shouldDirty: true })}
                  >
                    <SelectTrigger id="menu-category" className="w-full" aria-invalid={Boolean(errors.category_id)}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories_data.length > 0 ? (
                        <SelectGroup>
                          {categories_data.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>{category.category}</SelectItem>
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

                <Field hidden>
                  <FieldLabel htmlFor="menu-selling-price">Selling price <span className="font-normal text-muted-foreground">(optional)</span></FieldLabel>
                  <InputGroup>
                    <InputGroupAddon align="inline-start" className="px-2 text-sm font-medium text-muted-foreground">₱</InputGroupAddon>
                    <InputGroupInput id="menu-selling-price" type="number" min="0" step="0.01" placeholder="0.00" aria-invalid={Boolean(errors.selling_price)} {...register("selling_price")} />
                  </InputGroup>
                  <FieldDescription>You can set or change this later. Leave it blank for now if you prefer.</FieldDescription>
                  {errors.selling_price && <FieldError>{errors.selling_price.message}</FieldError>}
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
