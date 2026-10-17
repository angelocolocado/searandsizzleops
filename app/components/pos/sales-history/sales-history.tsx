import { useCallback, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  Filter,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  Store,
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

export type OrderItem = {
  name: string;
  quantity: number;
  modifiers: {
    name: string | null;
    quantity: number;
  }[];
};

export type Order = {
  id: number;
  order_number: number;
  cart_id: string;
  item_count: number | null;
  order_type: "dine_in" | "take_out" | null;
  payment_method: string | null;
  payment_status: "paid" | "pay_later" | null;
  status: "cooking" | "cooked" | "void" | "draft" | null;
  total_amount: number | null;
  void_reason: string | null;
  payment_intent_id: string | null;
  payment_qr_url: string | null;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
};

export type OrdersResponse = {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type Filters = {
  status: string;
  paymentStatus: string;
  orderType: string;
  orderNumber: string;
};

type SalesHistoryProps = {
  initialData: OrdersResponse;
  initialError?: string | null;
};

const emptyFilters: Filters = {
  status: "all",
  paymentStatus: "all",
  orderType: "all",
  orderNumber: "",
};

const statusClasses: Record<string, string> = {
  cooking:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-500/20",
  cooked:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-500/20",
  void: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/20",
  draft:
    "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-500/10 dark:text-slate-200 dark:ring-slate-500/20",
};

const formatCurrency = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
      }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatLabel = (value: string | null) =>
  value ? value.replaceAll("_", " ") : "—";

const getErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? "Unable to load sales history.";
  }

  return "Unable to load sales history.";
};

export function SalesHistory({
  initialData,
  initialError = null,
}: SalesHistoryProps) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(emptyFilters);
  const [result, setResult] = useState(initialData);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async (nextFilters: Filters, page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<OrdersResponse>("/v1/orders", {
        params: {
          ...(nextFilters.status !== "all" && { status: nextFilters.status }),
          ...(nextFilters.paymentStatus !== "all" && {
            payment_status: nextFilters.paymentStatus,
          }),
          ...(nextFilters.orderType !== "all" && {
            order_type: nextFilters.orderType,
          }),
          ...(nextFilters.orderNumber && {
            order_number: nextFilters.orderNumber,
          }),
          page,
          per_page: 25,
        },
      });

      setResult(response.data);
      setExpandedOrder(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
    void loadOrders(filters);
  };

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    void loadOrders(emptyFilters);
  };

  const pageSummary = useMemo(() => {
    if (!result.total || !result.data.length) {
      return "No orders found";
    }

    const from = (result.current_page - 1) * result.per_page + 1;
    const to = from + result.data.length - 1;
    return `Showing ${from}-${to} of ${result.total} orders`;
  }, [result]);

  const pageRevenue = result.data.reduce(
    (total, order) => total + (order.total_amount ?? 0),
    0,
  );
  const paidOrders = result.data.filter(
    (order) => order.payment_status === "paid",
  ).length;

  return (
    <main className="animate-in fade-in duration-500 ease-out px-5 py-4 scroll-smooth">
      <div className="space-y-5">
        <section className="flex flex-col gap-4 pb-1 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CircleDollarSign className="size-3.5" /> Point of sale
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Sales history
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review orders, payment status, and completed sales.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 self-start md:self-auto"
            onClick={() => void loadOrders(appliedFilters, result.current_page)}
            disabled={loading}
          >
            <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Total orders</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {result.total}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Matching the current filters
            </p>
          </div>
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Page revenue</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatCurrency(pageRevenue)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              From the displayed orders
            </p>
          </div>
          <div className="rounded-xl border bg-background/60 p-4">
            <p className="text-sm text-muted-foreground">Paid orders</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700 dark:text-emerald-300">
              {paidOrders}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">On this page</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <form
            className="flex flex-col gap-3 border-b bg-muted/30 p-3 xl:flex-row xl:items-end"
            onSubmit={(event) => {
              event.preventDefault();
              handleApplyFilters();
            }}
          >
            <div className="flex-1">
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="order-number"
              >
                Order number
              </label>
              <Input
                id="order-number"
                inputMode="numeric"
                placeholder="e.g. 103"
                value={filters.orderNumber}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    orderNumber: event.target.value,
                  }))
                }
              />
            </div>
            <FilterSelect
              label="Order status"
              value={filters.status}
              onValueChange={(value) =>
                setFilters((current) => ({ ...current, status: value }))
              }
              options={[
                ["all", "All statuses"],
                ["cooking", "Cooking"],
                ["cooked", "Cooked"],
                ["void", "Void"],
                ["draft", "Draft"],
              ]}
            />
            <FilterSelect
              label="Payment"
              value={filters.paymentStatus}
              onValueChange={(value) =>
                setFilters((current) => ({
                  ...current,
                  paymentStatus: value,
                }))
              }
              options={[
                ["all", "All payment statuses"],
                ["paid", "Paid"],
                ["pay_later", "Pay later"],
              ]}
            />
            <FilterSelect
              label="Order type"
              value={filters.orderType}
              onValueChange={(value) =>
                setFilters((current) => ({ ...current, orderType: value }))
              }
              options={[
                ["all", "All order types"],
                ["dine_in", "Dine in"],
                ["take_out", "Take out"],
              ]}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="gap-2">
                <Filter className="size-4" />
                Apply
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
                    Order
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Items
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground">
                    Payment
                  </TableHead>
                  <TableHead className="px-4 py-3 text-right text-xs uppercase tracking-wide text-muted-foreground">
                    Total
                  </TableHead>
                  <TableHead className="w-10 px-4 py-3" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-28 text-center text-sm text-muted-foreground"
                    >
                      Loading sales history...
                    </TableCell>
                  </TableRow>
                ) : result.data.length ? (
                  result.data.map((order) => {
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <OrderRows
                        key={order.id}
                        order={order}
                        isExpanded={isExpanded}
                        onToggle={() =>
                          setExpandedOrder(isExpanded ? null : order.id)
                        }
                      />
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-28 text-center text-sm text-muted-foreground"
                    >
                      No orders found.
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
                onClick={() => void loadOrders(appliedFilters, result.current_page - 1)}
                disabled={loading || result.current_page <= 1}
              >
                Previous
              </Button>
              <span className="min-w-20 text-center text-xs">
                Page {result.current_page} of {result.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadOrders(appliedFilters, result.current_page + 1)}
                disabled={loading || result.current_page >= result.last_page}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex-1">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={(nextValue) => onValueChange(nextValue ?? "all")}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function OrderRows({
  order,
  isExpanded,
  onToggle,
}: {
  order: Order;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow className={isExpanded ? "bg-muted/15" : undefined}>
        <TableCell className="px-4 py-3">
          <div className="font-medium">#{order.order_number}</div>
          <div className="text-xs text-muted-foreground">ID {order.id}</div>
        </TableCell>
        <TableCell className="px-4 py-3 text-sm text-muted-foreground">
          {formatDate(order.created_at)}
        </TableCell>
        <TableCell className="px-4 py-3">
          <div className="font-medium">{order.item_count ?? order.order_items.length}</div>
          <div className="text-xs text-muted-foreground">menu items</div>
        </TableCell>
        <TableCell className="px-4 py-3">
          <div className="flex items-center gap-1.5 capitalize">
            {order.order_type === "dine_in" ? (
              <Store className="size-3.5 text-muted-foreground" />
            ) : (
              <ShoppingBag className="size-3.5 text-muted-foreground" />
            )}
            {formatLabel(order.order_type)}
          </div>
        </TableCell>
        <TableCell className="px-4 py-3">
          <div
            className={`mb-1 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
              statusClasses[order.status ?? ""] ?? statusClasses.draft
            }`}
          >
            {formatLabel(order.status)}
          </div>
          <div className="text-xs capitalize text-muted-foreground">
            {formatLabel(order.payment_status)} · {formatLabel(order.payment_method)}
          </div>
        </TableCell>
        <TableCell className="px-4 py-3 text-right font-semibold tabular-nums">
          {formatCurrency(order.total_amount)}
        </TableCell>
        <TableCell className="px-4 py-3 text-right">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`${isExpanded ? "Hide" : "Show"} order items`}
            onClick={onToggle}
          >
            {isExpanded ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded ? (
        <TableRow className="bg-muted/10">
          <TableCell colSpan={7} className="px-4 py-3">
            <div className="rounded-lg border bg-background/60 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Order items
              </div>
              {order.order_items.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {order.order_items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className="flex items-start justify-between gap-3 rounded-md border p-2 text-sm"
                    >
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.modifiers.length ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {item.modifiers
                              .map(
                                (modifier) =>
                                  `${modifier.name ?? "Unnamed modifier"} × ${modifier.quantity}`,
                              )
                              .join(", ")}
                          </div>
                        ) : null}
                      </div>
                      <span className="shrink-0 text-muted-foreground">
                        × {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No item details available.
                </p>
              )}
              {order.void_reason ? (
                <p className="mt-3 text-xs text-rose-700 dark:text-rose-300">
                  Void reason: {order.void_reason}
                </p>
              ) : null}
            </div>
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
