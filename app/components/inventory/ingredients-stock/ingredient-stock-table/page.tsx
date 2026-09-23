import { createColumns } from "./columns"
import { DataTable } from "./data-table"
import type { IngredientDataType } from "./columns"
import type { CategoryDataType } from "~/components/ui/categories-manager"

type ComponentProps = {
  onEditItem: (item: IngredientDataType) => void
  ingredients_data: IngredientDataType[]
  categories_data: CategoryDataType[]
}

export default function IngredientsStockTable({ onEditItem, ingredients_data, categories_data }: ComponentProps) {

  return (
    <div className="w-full">
      <DataTable columns={createColumns({ onEdit: onEditItem, categories: categories_data })} data={ingredients_data} />
    </div>
  )
}