import { ReceiptText, TriangleAlert } from "lucide-react"

export type MenuCostsBreakdown = {
  item_name: string
  quantity_served: number | string
  unit_served: string
  cost: number | string
}

type ComponentProps = {
  ingredientCosts: MenuCostsBreakdown[]
  ingredientsTotal?: number | string | null
  sellingPrice?: number | string | null
  profit?: number | string | null
}

const formatCurrency = (amount?: number | string | null) => {
  const value = Number(amount)
  if (amount === null || amount === undefined || amount === "" || !Number.isFinite(value)) return "Not set"

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(value)
}

const formatQuantity = (quantity: number | string) => {
  const value = Number(quantity)
  if (!Number.isFinite(value)) return String(quantity)

  return new Intl.NumberFormat("en-PH", { maximumFractionDigits: 3 }).format(value)
}

export function MenuCostsSection({ ingredientCosts, ingredientsTotal, sellingPrice, profit }: ComponentProps) {
  const numericProfit = profit === null || profit === undefined || profit === "" ? null : Number(profit)
  const isLowProfit = numericProfit !== null && Number.isFinite(numericProfit) && numericProfit <= 10
  const isLoss = isLowProfit && numericProfit < 0

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <ReceiptText className="size-4 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold">Price & cost breakdown</h2>
          <p className="mt-1 text-xs text-muted-foreground">Calculated from the ingredients in the assigned recipes.</p>
        </div>
      </header>

      <div className="p-4">
        <dl className="divide-y rounded-lg border px-3">
          <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Selling price</dt>
            <dd className="font-semibold tabular-nums">{formatCurrency(sellingPrice)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Ingredient cost</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(ingredientsTotal)}</dd>
          </div>
          <div className={`flex items-center justify-between gap-3 py-2.5 text-sm ${isLowProfit ? "-mx-1 bg-destructive/5 px-2" : ""}`}>
            <dt className={`flex items-center gap-1.5 font-medium ${isLowProfit ? "text-destructive" : ""}`}>
              {isLowProfit && <TriangleAlert className="size-3.5" aria-hidden="true" />}
              Profit
              {isLowProfit && (
                <span className="rounded-full border border-destructive/20 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                  {isLoss ? "Loss" : "Low margin"}
                </span>
              )}
            </dt>
            <dd className={`font-semibold tabular-nums ${isLowProfit ? "text-destructive" : ""}`}>{formatCurrency(profit)}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground">Ingredient breakdown</h3>
            <span className="text-xs tabular-nums text-muted-foreground">{ingredientCosts.length} {ingredientCosts.length === 1 ? "item" : "items"}</span>
          </div>
          {ingredientCosts.length ? (
            <ul className="mt-2 divide-y max-h-30 overflow-x-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-amber-500 hover:scrollbar-thumb-amber-600 scrollbar-gutter-stable">
              {ingredientCosts.map((ingredient, index) => (
                <li key={`${ingredient.item_name}-${index}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{ingredient.item_name}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">{formatQuantity(ingredient.quantity_served)} {ingredient.unit_served} served</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{formatCurrency(ingredient.cost)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">No ingredient costs available.</p>
          )}
        </div>
      </div>
    </section>
  )
}