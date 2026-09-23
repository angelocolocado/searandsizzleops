import { Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { IngredientDataType } from "./ingredient-stock-table/columns";

const toneClasses: Record<string, string> = {
  rose: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20",
  slate: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-500/10 dark:text-slate-200 dark:ring-slate-500/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20",
}

type ComponentProps = {
  ingredients_data: IngredientDataType[]
}

export function Kpi({ ingredients_data } : ComponentProps){

    const criticalStock = ingredients_data.filter((ing) => ing.quantity < ing.reorder_level).length;
    const lowStock = ingredients_data.filter((ing) => ing.quantity >= ing.reorder_level && ing.quantity < ing.reorder_level + 6).length;
    const healthyStock = ingredients_data.filter((ing) => ing.quantity >= ing.reorder_level + 6).length;

    const stockKpis = [
        { label: "Low stock", value: lowStock + " items", detail: "Needs reorder soon", tone: "rose" },
        { label: "Critical stock", value: criticalStock + " items", detail: "Action required", tone: "amber" },
        { label: "Total ingredients", value: ingredients_data.length + " items", detail: "Across all categories", tone: "slate" },
        { label: "Healthy stock", value: healthyStock + " items", detail: "Ready for service", tone: "emerald" },
    ]

    return (<>
    
        <section className="rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-col gap-4 border-b px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                <p className="text-sm font-medium text-muted-foreground">Inventory Overview</p>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Ingredient stock</h1>
                </div>
                <Button hidden disabled className="gap-2" size="sm">
                    <Plus className="size-4" />
                    Add ingredient
                </Button>
            </div>

            <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
                {stockKpis.map((kpi) => (
                <div key={kpi.label} className="rounded-xl border bg-background/60 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                    <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${toneClasses[kpi.tone]}`}>
                        {kpi.tone === "rose" ? "Watch" : kpi.tone === "amber" ? "Alert" : kpi.tone === "slate" ? "Total" : "OK"}
                    </span>
                    </div>

                    <div className="space-y-1">
                    <p className="text-2xl font-semibold tracking-tight">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground">{kpi.detail}</p>
                    </div>
                </div>
                ))}
            </div>
        </section>

    </>)
}