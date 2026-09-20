  import { 
  Boxes, 
  ChefHat, 
  FolderTree, 
  History, 
  AlertCircle 
} from "lucide-react"


export const navItems = {
  inventory: [
    {
      title: "Stock List",
      url: "/inventory/stock",
      icon: Boxes,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Stock List", url: "/inventory/stock" },
      ],
    },
    {
      title: "Recipe Mapping",
      url: "/inventory/recipes",
      icon: ChefHat,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Recipe Mapping", url: "/inventory/recipes" },
      ],
    },
    {
      title: "Ingredient Stock",
      url: "/inventory/ingredients",
      icon: FolderTree,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Ingredient Stock", url: "/inventory/recipes" },
      ],
    },
    {
      title: "Stock Logs & Restock",
      url: "/inventory/logs",
      icon: History,
    },
  ],

}