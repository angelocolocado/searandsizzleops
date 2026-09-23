  import { 
  History, 
  Blender,
  CirclePile,
  Utensils,
  Barrel,
  BadgeDollarSign,
  Receipt
} from "lucide-react"


export const navItems = {
  inventory: [
    {
      title: "Recipe Mapping",
      url: "/inventory/recipes",
      icon: Blender,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Recipe Mapping", url: "/inventory/recipes" },
      ],
    },
    {
      title: "Recipe Mapping",
      isHidden: true,
      url: "/inventory/recipes/:id",
      icon: Blender,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Recipe Mapping", url: "/inventory/recipes" },
        { label: "Build Recipe", url: "#" },
      ],
    },
    {
      title: "Ingredient Stock",
      url: "/inventory/ingredients",
      icon: CirclePile,
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

  pos: [
    {
      title: "Menu",
      url: "/inventory/recipes/:id",
      icon: Utensils,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Recipe Mapping", url: "/inventory/recipes" },
        { label: "Build Recipe", url: "#" },
      ],
    },
    {
      title: "Modifiers",
      url: "/inventory/recipes/:id",
      icon: Barrel,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Recipe Mapping", url: "/inventory/recipes" },
        { label: "Build Recipe", url: "#" },
      ],
    },
    {
      title: "Sales History",
      url: "/inventory/recipes/:id",
      icon: BadgeDollarSign,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Recipe Mapping", url: "/inventory/recipes" },
        { label: "Build Recipe", url: "#" },
      ],
    },
  ],

  marketing: [
    {
      title: "Vouchers & Coupons",
      url: "/inventory/recipes/:id",
      icon: Receipt,
      breadcrumbs: [
        { label: "Inventory Management", url: "#" },
        { label: "Recipe Mapping", url: "/inventory/recipes" },
        { label: "Build Recipe", url: "#" },
      ],
    },
  ]

}