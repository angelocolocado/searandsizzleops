"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { useNavigate, useFetcher } from "react-router"
import { z } from "zod"

import { Button } from "~/components/ui/button"
import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "~/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "~/components/ui/input-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  type IngredientDataType,
} from "./ingredient-stock-table/columns"
import type { CategoryDataType } from "~/components/ui/categories-manager"
import { Spinner } from "~/components/ui/spinner"
import { id } from "zod/v4/locales"

export const unitOptions = ["pcs", "kg", "g", "lb", "oz", "L", "mL"] as const

const isUnit = (value: string): value is (typeof unitOptions)[number] =>
  unitOptions.includes(value as (typeof unitOptions)[number])

const normalizeUnit = (value: unknown): (typeof unitOptions)[number] => {
  const unit = String(value)
  return isUnit(unit) ? unit : "pcs"
}

type DrawerMode = "create" | "update"


const ingredientSchema = z.object({
  item_name: z.string().trim().min(2, "Ingredient name must be at least 2 characters."),
  category: z.string().trim().min(1, "Category is required."),
  quantity: z.string().trim().min(1, "Quantity is required.").refine((value) => Number(value) > 0, {
    message: "Quantity must be greater than 0.",
  }),
  unit: z.enum(unitOptions),
  reorder_level: z.string().trim().refine((value) => value === "" || Number(value) >= 0, {
    message: "Reorder level cannot be negative.",
  }),
  notes: z.string().max(250, "Notes must be under 250 characters.").optional().or(z.literal("")),
})

type IngredientFormValues = z.infer<typeof ingredientSchema>

const defaultValues: IngredientFormValues = {
  item_name: "",
  category: "",
  quantity: "",
  unit: "pcs",
  reorder_level: "",
  notes: "",
}

export function AddUpdateDrawer({
  mode,
  item,
  open,
  categories,
  onOpenChange,
}: {
  mode: DrawerMode
  item?: IngredientDataType | null
  open: boolean
  categories: CategoryDataType[],
  onOpenChange: (nextOpen: boolean) => void
}) {
  const isCreate = mode === "create"
  const navigate = useNavigate()

  const findCategory = (data: any) => {
    const category = categories.find((category) => category.id === Number(data))
    return category?.category || '---'
  }

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isDirty },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    mode: "onChange",
    defaultValues: {
      ...defaultValues,
      ...(item
        ? {
            item_name: item.item_name,
            category: findCategory(item.category_id),
            quantity: String(item.quantity),
            unit: "pcs",
            reorder_level: "",
            notes: "",
          }
        : {}),
    },
  })

  const quantityValue = watch("quantity")

  const handleCategoryValueChange = (value: string | null) => {
    if (!value || value === "__manage_categories__") {
      if (value === "__manage_categories__") {
        onOpenChange(false)
        navigate("/inventory/ingredients#categories-manager")
      }
      return
    }

    setValue("category", value, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }

  useEffect(() => {
    if (!open) return

    reset({
      ...defaultValues,
      ...(item
        ? {
            item_name: item.item_name,
            category: findCategory(item.category_id),
            quantity: String(item.quantity),
            unit: normalizeUnit(item.unit),
            reorder_level: String(item.reorder_level),
            notes: "",
          }
        : {}),
    })
  }, [item, open, reset])

  const fetcher = useFetcher()

  const onSubmit: SubmitHandler<IngredientFormValues> = (values) => {

    const parsedQuantity = Number(values.quantity)
    const parsedreorder_level = values.reorder_level ? Number(values.reorder_level) : 0

    const selectedCategory = categories.find(
      (category) => category.category === values.category
    )

    const payload = {
      ...values,
      category: selectedCategory?.id,
      quantity: parsedQuantity,
      reorder_level: parsedreorder_level,
      intent: isCreate ? "POST" : "UPDATE",
      id: item?.id || null
    }

    fetcher.submit(payload, {
      method: "POST",
      action: "/inventory/ingredients",
      encType: "application/json",
    });
  }

  useEffect(() => {
    if(fetcher.state === "idle" && fetcher.data?.success === true){
      onOpenChange(false)
    }
  }, [fetcher.state, fetcher.data])

  return (
    <DrawerContent>
      <DrawerHeader>
        <DrawerTitle>{isCreate ? "Add ingredient" : `Update ${item?.item_name ?? "ingredient"}`}</DrawerTitle>
        <DrawerDescription>
          {isCreate
            ? "Create a new ingredient entry and keep your stock counts accurate for the kitchen."
            : "Update the ingredient details, stock level, and restocking status for this inventory item."}
        </DrawerDescription>
      </DrawerHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          <FieldSet className="gap-5" disabled={fetcher.state !== "idle"}>
            <FieldGroup>
              <Field>
                <FieldContent>
                  <FieldLabel htmlFor="item_name">Ingredient name</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id="item_name"
                      placeholder="e.g. Fresh basil"
                      aria-invalid={Boolean(errors.item_name)}
                      {...register("item_name")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.item_name]} />
                </FieldContent>
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select
                      value={watch("category")}
                      onValueChange={handleCategoryValueChange}
                    >
                      <SelectTrigger id="category" className="h-9 w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.updated_at} value={category.category}>
                                {category.category}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="text-center px-2 py-2 text-sm text-muted-foreground">No categories yet</div>
                          )}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectItem
                          value="__manage_categories__"
                          className="
                            pb-1
                            px-0
                            text-center
                            [&_[data-radix-select-item-text]]:w-full
                            [&_[data-radix-select-item-text]]:text-center
                          "
                        >
                          <div className="w-full h-full pb-1">
                            Manage categories
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.category]} />
                  </FieldContent>
                </Field>

              </div>

              <div className="grid gap-4 md:grid-cols-[1fr_120px]">
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="quantity"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0"
                        aria-invalid={Boolean(errors.quantity)}
                        {...register("quantity")}
                      />
                      <InputGroupAddon align="inline-end" className="px-2 text-xs uppercase tracking-wide text-muted-foreground">
                        {watch("unit")}
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldError errors={[errors.quantity]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="unit">Unit</FieldLabel>
                    <Select
                      value={watch("unit")}
                      onValueChange={(value) => setValue("unit", value as (typeof unitOptions)[number], { shouldValidate: true })}
                    >
                      <SelectTrigger id="unit" className="h-9 w-full">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {unitOptions.map((unit) => (
                            <SelectItem key={unit} value={unit}>
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[errors.unit]} />
                  </FieldContent>
                </Field>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="reorder_level">Reorder level</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="reorder_level"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        aria-invalid={Boolean(errors.reorder_level)}
                        {...register("reorder_level")}
                      />
                    </InputGroup>
                    <FieldDescription>Threshold before restocking is needed.</FieldDescription>
                    <FieldError errors={[errors.reorder_level]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldContent>
                    <FieldLabel htmlFor="quantity-preview">Current stock</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id="quantity-preview"
                        value={quantityValue ? `${quantityValue} ${watch("unit")}` : "0 pcs"}
                        readOnly
                        className="cursor-default text-muted-foreground"
                      />
                    </InputGroup>
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldContent>
                  <FieldLabel htmlFor="notes">Notes</FieldLabel>
                  <InputGroup className="h-auto min-h-[96px]">
                    <InputGroupTextarea
                      id="notes"
                      placeholder="Optional notes for shelf life, supplier, or prep details."
                      aria-invalid={Boolean(errors.notes)}
                      {...register("notes")}
                    />
                  </InputGroup>
                  <FieldError errors={[errors.notes]} />
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </div>

        <DrawerFooter className="border-t pt-3 bg-muted/20">
          <div className="flex w-full items-center justify-end gap-2">
            <DrawerClose render={<Button type="button" disabled={fetcher.state !== "idle"} variant="outline">Cancel</Button>} />
            <Button type="submit" className="h-[34px]" disabled={(!isValid && !isDirty) || fetcher.state !== "idle"}>
              {fetcher.state !== "idle" && <Spinner />}
              {isCreate ? "Create ingredient" : "Save changes"}
            </Button>
          </div>
        </DrawerFooter>
      </form>
    </DrawerContent>
  )
}