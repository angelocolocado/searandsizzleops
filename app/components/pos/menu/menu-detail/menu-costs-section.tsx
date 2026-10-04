import { ReceiptText, TriangleAlert } from "lucide-react"

export type MenuCostsBreakdown = {
  item_name: string
  quantity_served: number | string
  unit_served: string
  cost: number | string
}

export type MenuModifierProfit = {
  name: string
  selling_price: number | string
  ingredient_cost: number | string
  profit: number | string
}

export type MenuProfitBreakdown = {
  menu: number | string
  modifiers: MenuModifierProfit[]
  total: number | string
}

type ComponentProps = {
  ingredientCosts: MenuCostsBreakdown[]
  ingredientsTotal?: number | string | null
  sellingPrice?: number | string | null
  profit?: MenuProfitBreakdown | null
}

const formatCurrency = (amount?: number | string | null) => {
  const value = Number(amount)
  if (amount === null || amount === undefined || amount === "" || !Number.isFinite(value)) return "Not set"

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

const formatQuantity = (quantity: number | string) => {
  const value = Number(quantity)
  if (!Number.isFinite(value)) return String(quantity)

  return new Intl.NumberFormat("en-PH", { maximumFractionDigits: 3 }).format(value)
}

export function MenuCostsSection({ ingredientCosts, ingredientsTotal, sellingPrice, profit }: ComponentProps) {
  const numericProfit = profit == null || profit.total === "" ? null : Number(profit.total)
  const isLowProfit = numericProfit !== null && Number.isFinite(numericProfit) && numericProfit <= 10
  const isLoss = isLowProfit && numericProfit < 0
  const recipeCosts = ingredientCosts.filter((item) => item.unit_served.trim().toLowerCase() !== "modifier")
  const modifierCosts = ingredientCosts.filter((item) => item.unit_served.trim().toLowerCase() === "modifier")

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <ReceiptText className="size-4 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold">Price & cost breakdown</h2>
          <p className="mt-1 text-xs text-muted-foreground">Ingredient costs and profit are calculated from the menu and its assigned modifiers.</p>
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
          <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <dt className="text-muted-foreground">Menu profit</dt>
            <dd className="font-medium tabular-nums">{formatCurrency(profit?.menu)}</dd>
          </div>
          {Boolean(profit?.modifiers.length) && (
            <div className="border-t">
              <p className="pt-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Modifier profit</p>
              {profit?.modifiers.map((modifier, index) => (
                <div key={`${modifier.name}-${index}`} className="flex flex-col gap-1 py-2.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="font-medium">{modifier.name} profit</dt>
                    <dd className="font-medium tabular-nums">{formatCurrency(modifier.profit)}</dd>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Selling price {formatCurrency(modifier.selling_price)} − ingredient cost {formatCurrency(modifier.ingredient_cost)}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className={`flex items-center justify-between gap-3 border-t py-2.5 text-sm ${isLowProfit ? "-mx-1 bg-destructive/5 px-2" : ""}`}>
            <dt className={`flex items-center gap-1.5 font-semibold ${isLowProfit ? "text-destructive" : ""}`}>
              {isLowProfit && <TriangleAlert className="size-3.5" aria-hidden="true" />}
              Total profit
              {isLowProfit && (
                <span className="rounded-full border border-destructive/20 bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                  {isLoss ? "Loss" : "Low margin"}
                </span>
              )}
            </dt>
            <dd className={`font-semibold tabular-nums ${isLowProfit ? "text-destructive" : ""}`}>{formatCurrency(profit?.total)}</dd>
          </div>
        </dl>

        <div className="mt-4 border-t pt-3">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground">Cost breakdown</h3>
          {recipeCosts.length > 0 && (
            <CostBreakdownGroup title="Recipe ingredients" costs={recipeCosts} />
          )}
          {modifierCosts.length > 0 && (
            <CostBreakdownGroup title="Modifier costs" costs={modifierCosts} />
          )}
          {ingredientCosts.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">No ingredient costs available.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function CostBreakdownGroup({ title, costs }: { title: string; costs: MenuCostsBreakdown[] }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        <span className="text-xs tabular-nums text-muted-foreground">{costs.length} {costs.length === 1 ? "item" : "items"}</span>
      </div>
      <ul className="mt-1 divide-y max-h-30 overflow-x-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-amber-500 hover:scrollbar-thumb-amber-600 scrollbar-gutter-stable">
        {costs.map((item, index) => (
          <li key={`${item.item_name}-${item.unit_served}-${index}`} className="flex items-center justify-between gap-3 py-2.5 text-sm">
            <span className="min-w-0">
              <span className="block truncate font-medium">{item.item_name}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {formatQuantity(item.quantity_served)} {item.unit_served} served
              </span>
            </span>
            <span className="shrink-0 font-medium tabular-nums">{formatCurrency(item.cost)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}