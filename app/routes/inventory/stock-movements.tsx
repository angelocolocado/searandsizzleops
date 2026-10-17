import type { Route } from "./+types/stock-movements";
import api from "~/lib/axios";
import {
  StockMovements,
  type StockMovementResponse,
} from "~/components/inventory/stock-movements/stock-movements";

const emptyResponse: StockMovementResponse = {
  current_page: 1,
  data: [],
  last_page: 1,
  per_page: 25,
  total: 0,
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sear Sizzling QC | Admin - Stock Logs & Restock" },
    {
      name: "description",
      content: "Review stock deductions and restorations caused by orders.",
    },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get<StockMovementResponse>(
      "/v1/stock-movements",
      { params: { per_page: 25, page: 1 } },
    );

    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: emptyResponse,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load stock movements.",
    };
  }
}

export default function StockMovementsRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <StockMovements
      initialData={loaderData.data}
      initialError={loaderData.error}
    />
  );
}
