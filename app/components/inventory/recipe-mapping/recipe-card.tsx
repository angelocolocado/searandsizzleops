
import { cn } from "cn"
import { ArrowRight } from "lucide-react"
import { NavLink } from "react-router"
import { Button } from "~/components/ui/button"
import { statusStyles } from "./manage-recipe/header"

type ComponentProps = {
  recipe_name: string
  latest_update: string
  date_added: string
  status: string
  id: string
  category: string
  selling_price?: number | string | null
  onView?: () => void
}


const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export function RecipePreviewCard({
  recipe_name,
  date_added,
  latest_update,
  status,
  id,
  category,
  selling_price,
  onView,
}: ComponentProps) {

  return (
    <article className="animate-in fade-in duration-500 ease-out w-full rounded-lg border bg-muted/40 p-3.5 shadow-[0_1px_0_rgba(15,23,42,0.02)] transition-all duration-200 hover:bg-muted/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">
            {recipe_name}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">Date added: {formatDate(date_added)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Latest update: {formatDate(latest_update)}</p>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-medium capitalize ${statusStyles[status]}`}
        >
          {status}
        </span>

      </div>

      <div className="mt-3 flex items-center justify-between">

        <div className="min-w-0">
          <p className="mt-1 truncate text-xs text-muted-foreground">{category}</p>
          {category?.toLowerCase() === "addon" && selling_price != null && (
            <p className="mt-1 text-xs font-medium text-foreground">
              Selling price: {new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(selling_price))}
            </p>
          )}
        </div>

        <NavLink to={`/inventory/recipes/${id}`}>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={onView}
            className="h-7 px-2.5 text-xs font-medium text-foreground/80"
            id={id}
          >
            View Recipe <ArrowRight />
          </Button>
        </NavLink>
        
      </div>
    </article>
  )
}