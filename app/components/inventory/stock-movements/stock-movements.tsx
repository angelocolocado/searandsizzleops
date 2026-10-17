import { useCallback, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  History,
  RefreshCw,
  Search,
  RotateCcw,
} from "lucide-react";
import { isAxiosError } from "axios";
import api from "~/lib/axios";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export type StockMovement = {
  id: number;
  order_id: number;
  order_number: number | null;
  order_status: string | null;
  void_reason: number | null;
  ingredient_id: number;
  ingredient_name: string | null;
  ingredient_unit: string | null;
  movement_type: "deduction" | "restoration";
  quantity: number;
  created_at: string;
};

export type StockMovementResponse = {
  current_page: number;
  data: StockMovement[];
  last_page: number;
  per_page: number;
  total: number;
};

type StockMovementsProps = {
  initialData: StockMovementResponse;
  initialError?: string | null;
};

type Filters = {
  movementType: string;
  orderId: string;
  ingredientId: string;
};

const emptyFilters: Filters = {
  movementType: "all",
  orderId: "",
  ingredientId: "",
};

const badgeClasses = {
  deduction:
    "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/20",
  restoration:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatQuantity = (movement: StockMovement) =>
  `${new Intl.NumberFormat("en-PH", { maximumFractionDigits: 3 }).format(
    movement.quantity,
  )} ${movement.ingredient_unit ?? ""}`.trim();

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? "Unable to load stock movements.";
  }

  return "Unable to load stock movements.";
};

export function StockMovements({
  initialData,
  initialError = null,
}: StockMovementsProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [result, setResult] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const loadMovements = useCallback(
    async (nextFilters: Filters, page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<StockMovementResponse>(
          "/v1/stock-movements",
          {
            params: {
              ...(nextFilters.movementType !== "all" && {
                movement_type: nextFilters.movementType,
              }),
              ...(nextFilters.orderId && { order_id: nextFilters.orderId }),
              ...(nextFilters.ingredientId && {
                ingredient_id: nextFilters.ingredientId,
              }),
              page,
              per_page: 25,
            },
          },
        );

        setResult(response.data);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    void loadMovements(filters);
  };

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    void loadMovements(emptyFilters);
  };

  const handlePageChange = (page: number) => {
    void loadMovements(appliedFilters, page);
  };

  const pageSummary = useMemo(() => {
    if (!result.total || !result.data.length) {
      return "No stock movements found";
    }

    const from = (result.current_page - 1) * result.per_page + 1;
    const to = from + result.data.length - 1;
    return `Showing ${from}-${to} of ${result.total} movements`;
  }, [result]);

  const deductions = result.data.filter(
    (movement) => movement.movement_type === "deduction",
  ).length;
  const restorations = result.data.filter(
    (movement) => movement.movement_type === "restoration",
  ).length;

  return (
    <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 pb-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <History className="size-3.5" /> Inventory management
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Stock logs &amp; restock
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review stock deductions and restorations caused by orders.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 self-start md:self-auto"
            onClick={() => void loadMovements(appliedFilters, result.current_page)}
            disabled={loading}
          >
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Total movements</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {result.total}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Matching the current filters
            </p>
          </div>
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Deductions</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-rose-700 dark:text-rose-300">
              {deductions}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              On this page
            </p>
          </div>
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Restorations</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
              {restorations}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              On this page
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <form
            className="flex flex-col gap-3 border-b bg-muted/30 p-3 lg:flex-row lg:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              handleApplyFilters();
            }}
          >
            <div className="flex-1">
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="stock-order-id"
              >
                Order ID
              </label>
              <Input
                id="stock-order-id"
                inputMode="numeric"
                placeholder="e.g. 45"
                value={filters.orderId}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    orderId: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="stock-ingredient-id"
              >
                Ingredient ID
              </label>
              <Input
                id="stock-ingredient-id"
                inputMode="numeric"
                placeholder="e.g. 7"
                value={filters.ingredientId}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    ingredientId: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Movement type
              </label>
              <Select
                value={filters.movementType}
                onValueChange={(value) =>
                  setFilters((current) => ({
                    ...current,
                    movementType: value ?? "all",
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All movement types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All movement types</SelectItem>
                  <SelectItem value="deduction">Deductions</SelectItem>
                  <SelectItem value="restoration">Restorations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="gap-2">
                <Search className="size-4" />
                Apply filters
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleResetFilters}
                disabled={loading}
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
            </div>
          </form>

          {error ? (
            <div className="m-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Movement
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Ingredient
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Quantity
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Order
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-sm text-muted-foreground"
                    >
                      Loading stock movements...
                    </TableCell>
                  </TableRow>
                ) : result.data.length ? (
                  result.data.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                        {formatDate(movement.created_at)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${badgeClasses[movement.movement_type]}`}
                        >
                          {movement.movement_type === "deduction" ? (
                            <ArrowDownToLine className="size-3" />
                          ) : (
                            <ArrowDownUp className="size-3" />
                          )}
                          {movement.movement_type}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="font-medium">
                          {movement.ingredient_name ?? "Unknown ingredient"}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium">
                        {formatQuantity(movement)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="font-medium">
                          #{movement.order_number ?? movement.order_id}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="capitalize">
                          {movement.order_status ?? "—"}
                        </div>
                        {movement.void_reason !== null ? (
                          <div className="text-xs text-muted-foreground">
                            Void reason {movement.void_reason}
                          </div>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-28 text-center text-sm text-muted-foreground"
                    >
                      No stock movements found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 border-t p-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>{pageSummary}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => handlePageChange(result.current_page - 1)}
                disabled={loading || result.current_page <= 1}
              >
                <ArrowLeft className="size-4" />
                Previous
              </Button>
              <span className="min-w-20 text-center text-xs">
                Page {result.current_page} of {result.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => handlePageChange(result.current_page + 1)}
                disabled={loading || result.current_page >= result.last_page}
              >
                Next
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
