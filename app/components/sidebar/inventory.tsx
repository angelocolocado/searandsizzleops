import { 
  SidebarGroup, 
  SidebarGroupLabel, 
  SidebarGroupContent,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "../ui/sidebar"

import { NavLink, useLocation } from "react-router"

type InventoryNavItem = {
    title: string,
    url: string,
    icon: React.ElementType
}

type ComponentProps = {
    inventoryNav: InventoryNavItem[]
}

export function InventorySidebar({ inventoryNav } : ComponentProps) {
    const location = useLocation() // Kukunin ang kasalukuyang pathname

    return (
        <SidebarGroup>
          <SidebarGroupLabel>Inventory Management</SidebarGroupLabel>
          <SidebarGroupContent>
              <SidebarMenu>
              {inventoryNav.map((item) => {
                  const isActive = location.pathname === item.url

                  return (
                      <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton>
                            <NavLink 
                                to={item.url} 
                                className={({ isActive }) => 
                                    `flex items-center gap-2 w-full py-2 rounded-md ${
                                        isActive ? "underline font-medium" : ""
                                    }`
                                }
                            >
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                  )
              })}
              </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
    )
}