import type { Route } from "./+types/sales-history";
import api from "~/lib/axios";
import {
  SalesHistory,
  type OrdersResponse,
} from "~/components/pos/sales-history/sales-history";

const emptyResponse: OrdersResponse = {
  data: [],
  current_page: 1,
  last_page: 1,
  per_page: 25,
  total: 0,
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sear Sizzling QC | Admin - Sales History" },
    {
      name: "description",
      content: "Review orders, payment status, and completed sales.",
    },
  ];
}

export async function clientLoader() {
  try {
    const response = await api.get<OrdersResponse>("/v1/orders", {
      params: { per_page: 25, page: 1 },
    });

    return { data: response.data, error: null };
  } catch (error) {
    return {
      data: emptyResponse,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load sales history.",
    };
  }
}

export default function SalesHistoryRoute({
  loaderData,
}: Route.ComponentProps) {
  return (
    <SalesHistory
      initialData={loaderData.data}
      initialError={loaderData.error}
    />
  );
}
