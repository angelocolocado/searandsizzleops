import { ReceiptText } from "lucide-react"

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

const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const sumCosts = (items: MenuCostsBreakdown[]) =>
  items.reduce((total, item) => total + (toNumber(item.cost) ?? 0), 0)

const formatCurrency = (value: number | string | null | undefined) => {
  const amount = toNumber(value)
  if (amount === null) return "Not set"

  return `₱${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`
}

const formatQuantity = (quantity: number | string) => {
  const value = Number(quantity)
  if (!Number.isFinite(value)) return String(quantity)

  return new Intl.NumberFormat("en-PH", { maximumFractionDigits: 3 }).format(value)
}

export function MenuCostsSection({ ingredientCosts, ingredientsTotal, sellingPrice, profit }: ComponentProps) {
  const recipeCosts = ingredientCosts.filter((item) => item.unit_served.trim().toLowerCase() !== "modifier")
  const modifierCosts = ingredientCosts.filter((item) => item.unit_served.trim().toLowerCase() === "modifier")
  const recipeIngredientTotal = sumCosts(recipeCosts)
  const modifierIngredientTotal = sumCosts(modifierCosts)
  const baseSellingPrice = toNumber(sellingPrice)
  const modifierSellingTotal = (profit?.modifiers ?? []).reduce(
    (total, modifier) => total + (toNumber(modifier.selling_price) ?? 0),
    0,
  )
  //const totalSellingPrice = baseSellingPrice === null ? null : baseSellingPrice + modifierSellingTotal

  const totalSellingPrice = baseSellingPrice

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center gap-2 border-b px-4 py-3">
        <ReceiptText className="size-4 text-muted-foreground" />
        <div>
          <h2 className="text-sm font-semibold">Price & Cost Breakdown</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Menu pricing, add-on pricing, ingredient costs, and profit are shown separately.
          </p>
        </div>
      </header>

      <div className="space-y-4 p-4">
        <BreakdownGroup title="Menu base">
          <SummaryRow label="Base menu price" value={formatCurrency(sellingPrice)} emphasized />
          <SummaryRow label="Recipe ingredient costs" value={formatCurrency(recipeIngredientTotal)} />
          <SummaryRow label="Base menu profit" value={formatCurrency(profit?.menu)} />
        </BreakdownGroup>

        <BreakdownGroup title="Totals" emphasized>
          <SummaryRow label="Total selling price" value={formatCurrency(totalSellingPrice)} emphasized />
          <SummaryRow label="Total ingredient cost" value={formatCurrency(ingredientsTotal)} />
          <SummaryRow label="Total profit" value={formatCurrency(profit?.total)} emphasized />
        </BreakdownGroup>

        <div className="border-t pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cost breakdown</h3>
          {recipeCosts.length > 0 && (
            <CostBreakdownGroup title="Recipe ingredients" costs={recipeCosts} />
          )}
          {modifierCosts.length > 0 && (
            <CostBreakdownGroup title="Optional Modifier costs" costs={modifierCosts} />
          )}
          {ingredientCosts.length === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">No ingredient costs available.</p>
          )}
        </div>
      </div>
    </section>
  )
}

function BreakdownGroup({
  title,
  children,
  emphasized = false,
  hidden = false
}: {
  title: string
  children: React.ReactNode
  emphasized?: boolean,
  hidden?: boolean
}) {
  return (
    <section className={`rounded-lg border px-3 ${hidden} ${emphasized ? "bg-muted/30" : ""}`}>
      <h3 className="border-b py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="divide-y">{children}</div>
    </section>
  )
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className={emphasized ? "font-semibold" : "text-muted-foreground"}>{label}</span>
      <span className={`${emphasized ? "font-semibold" : "font-medium"} shrink-0 tabular-nums`}>{value}</span>
    </div>
  )
}

function CostBreakdownGroup({ title, costs }: { title: string; costs: MenuCostsBreakdown[] }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
        <span className="text-xs tabular-nums text-muted-foreground">
          {costs.length} {costs.length === 1 ? "item" : "items"}
        </span>
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
