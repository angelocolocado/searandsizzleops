import type { Route } from "./+types/inventory-stock";
import { StockList } from "~/components/inventory/stock-list";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function InventoryStock() {

  return <StockList />
}