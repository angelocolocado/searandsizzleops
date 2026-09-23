"use client"

import { createColumnHelper } from "@tanstack/react-table"
import { format, parseISO } from "date-fns"
import { Form } from "react-router"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

import { type DataTableFeatures } from "./data-table-features"
import type { CategoryDataType } from "~/components/ui/categories-manager"
import { unitOptions } from "../add-update-drawer"



export type IngredientDataType = {
  id: number
  category_id: string
  quantity: number
  item_name: string
  updated_at: string
  reorder_level: number
  unit: string
}

const getStockStatus = (
  quantity: number,
  reorderLevel: number
): number => {
  if (quantity <= reorderLevel) {
    return 0
  }

  if (quantity <= reorderLevel + 5) {
    return 1
  }

  return 2
}

const stockStatusLabels = ['Restock Needed', 'Watch Stock', 'Healthy Stock']

const stockStatusStyle = [
  "bg-red-100 border border-red-200",
  "bg-yellow-100 border border-yellow-200",
  "bg-green-100 border border-green-200",
]

function FilterSelect({
  value,
  placeholder,
  options,
  onChange,
  width = "w-[140px]",
}: {
  value: string | undefined
  placeholder: string
  options: { value: string; label: string }[]
  onChange: (value: string | undefined) => void
  width?: string
}) {
  const optionMap = new Map(options.map((option) => [option.value, option.label]))
  const displayValue = value && value !== "all" ? (optionMap.get(value) ?? value) : placeholder

  return (
    <Select
      value={value ?? "all"}
      onValueChange={(nextValue) => {
        const normalizedValue = nextValue ?? "all"
        onChange(normalizedValue === "all" ? undefined : normalizedValue)
      }}
    >
      <SelectTrigger className={`h-8 border-none bg-transparent px-2 text-xs font-medium shadow-none ${width}`}>
        <SelectValue placeholder={displayValue} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const columnHelper = createColumnHelper<DataTableFeatures, IngredientDataType>()

export function createColumns({ onEdit, categories }: { onEdit: (item: IngredientDataType) => void, categories: CategoryDataType[] }) {
  
  return columnHelper.columns([
    columnHelper.accessor("item_name", {
      id: "item_name",
      header: "Item name",
      meta: {
        className: "min-w-[220px] w-[220px]",
      },
      cell: (info) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{info.getValue()}</p>
        </div>
      ),
    }),
    columnHelper.accessor("category_id", {
      id: "category",
      header: ({ column }) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Category
          </span>
          <FilterSelect
            value={(column.getFilterValue() as string | undefined) ?? "all"}
            placeholder="All"
            options={[{ value: "all", label: "All" }, ...categories.map((category) => ({ value: category.category, label: category.category }))]}
            onChange={(nextValue) => column.setFilterValue(nextValue)}
            width="w-[118px]"
          />
        </div>
      ),
      cell: (info) => {
        const categoryId = info.getValue()
        const category = categories.find((category) => category.id === Number(categoryId))

        return category?.category || '---'
      },
      filterFn: (row, _columnId, filterValue) => {
        const category = categories.find((category) => category.id === Number(row.original.category_id))
        return category?.category === filterValue
      },
      meta: {
        className: "min-w-[150px] w-[150px]",
      }
      
    }),
    columnHelper.accessor("updated_at", {
      id: "date",
      header: ({ column }) => {
        const currentSort = column.getIsSorted()
        const isAscending = currentSort === "asc"

        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Date
              </span>
            </div>
            <FilterSelect
              value={(column.getFilterValue() as string | undefined) ?? "all"}
              placeholder="All"
              options={[
                { value: "all", label: "All" },
                { value: "7d", label: "7d" },
                { value: "30d", label: "30d" },
                { value: "older", label: "Older" },
              ]}
              onChange={(nextValue) => column.setFilterValue(nextValue)}
              width="w-[118px]"
            />
          </div>
        )
      },
      meta: {
        className: "min-w-[150px] w-[150px]",
      },
      cell: (info) => {
        const rawDate = info.getValue()
        if (!rawDate) return "-"
        return <span className="whitespace-nowrap text-sm text-muted-foreground">{format(parseISO(rawDate), "MMM d, yyyy")}</span>
      },
      filterFn: (row, _columnId, filterValue) => {
        const rawDate = row.original.updated_at
        if (!rawDate) return false

        const ageInDays = (Date.now() - parseISO(rawDate).getTime()) / (1000 * 60 * 60 * 24)

        if (filterValue === "7d") return ageInDays <= 7
        if (filterValue === "30d") return ageInDays <= 30
        if (filterValue === "older") return ageInDays > 30
        return true
      },
    }),
    columnHelper.accessor("quantity", {
      id: "quantity",
      header: ({ column }) => (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Quantity
          </span>
          <FilterSelect
            value={(column.getFilterValue() as string | undefined) ?? "all"}
            placeholder="All"
            options={[
              { value: "all", label: "All" },
              ...unitOptions.map((unit) => ({
                value: unit,
                label: unit,
              })),
            ]}
            onChange={(nextValue) => column.setFilterValue(nextValue)}
            width="w-[120px]"
          />
        </div>
      ),
      meta: {
        className: "min-w-[130px] w-[130px]",
      },
      cell: (info) => (
        <div className="flex items-center justify-start">
          <span className="tabular-nums text-sm font-medium text-foreground">{info.getValue()} {info.row.original.unit}</span>
        </div>
      ),
      filterFn: (row, _columnId, filterValue) => row.original.unit === filterValue,
    }),
    columnHelper.accessor((row) => getStockStatus(row.quantity, row.reorder_level),
      {
        id: "status",

        header: ({ column }) => (
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Status
            </span>

            <FilterSelect
              value={(column.getFilterValue() as string | undefined) ?? "all"}
              placeholder="All"
              options={[
                { value: "all", label: "All" },
                {
                  value: "restock_needed",
                  label: "Restock needed",
                },
                {
                  value: "watch_out",
                  label: "Watch stock",
                },
                {
                  value: "healthy",
                  label: "Healthy stock",
                },
              ]}
              onChange={(nextValue) => column.setFilterValue(nextValue)}
              width="w-[130px]"
            />
          </div>
        ),

        cell: (info) => {
          const status = info.getValue()
          return (
            <span className={`py-1 px-2 rounded-xl ${stockStatusStyle[(Number(status))]}`}>
              {stockStatusLabels[Number(status)]}
            </span>
          )
        },

        filterFn: (row, _columnId, filterValue) => {
          const status = getStockStatus(row.original.quantity, row.original.reorder_level)
          const statusByFilter: Record<string, number> = {
            restock_needed: 0,
            watch_out: 1,
            healthy: 2,
          }

          return status === statusByFilter[filterValue]
        },

        meta: {
          className: "min-w-[170px] w-[170px]",
        },
      }
    ),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      meta: {
        className: "min-w-[170px] w-[170px]",
      },
      cell: ({ row }) => {
        const item = row.original

        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" id={String(item.id)} className="h-7 px-2.5 text-xs" onClick={() => onEdit(item)}>
              Update
            </Button>
            <Form method="DELETE">
              <Button size="sm" type="submit" variant="destructive" className="h-7 px-2.5 text-xs">
                Delete
              </Button>
              <input type="hidden" hidden name="id" id="id" value={item.id} defaultValue={item.id} />
            </Form>
          </div>
        )
      },
    }),
  ])
}
