import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { SidebarNavigations } from "./inventory"
import { navItems } from "./data"

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    
                    <div className="flex aspect-square size-10 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                      <img src="/logo.png" alt="" />
                    </div>
                    <p className="font-logo font-semibold tracking-wide text-xl">Sear and Sizzle</p>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>

        <SidebarNavigations title="Inventory Management" nav_items={navItems.inventory}  />
        <SidebarNavigations title="Point of Sale Management" nav_items={navItems.pos}  />
        <SidebarNavigations title="Marketing / Promotions" nav_items={navItems.marketing}  />
        <SidebarNavigations title="System Settings" nav_items={navItems.system_settings}  />


      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  )
}