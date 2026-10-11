import { useEffect, useState } from "react"
import { LogOut } from "lucide-react"
import { useFetcher } from "react-router"
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
import { Button } from "../ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"

export function AppSidebar() {
  const [isSignOutOpen, setIsSignOutOpen] = useState(false)
  const fetcher = useFetcher<{ success: boolean; message?: string }>()
  const isSigningOut = fetcher.state !== "idle"

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success) {
      window.location.href = "/login"
    }
  }, [fetcher.data, fetcher.state])

  return (
    <Sidebar className="animate-in fade-in duration-500 ease-out slide-in-from-left-full" collapsible="icon">
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
      <SidebarFooter>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          onClick={() => setIsSignOutOpen(true)}
        >
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </SidebarFooter>
      <Dialog open={isSignOutOpen} onOpenChange={setIsSignOutOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          {fetcher.data && !fetcher.data.success && (
            <p role="alert" aria-live="assertive" className="text-sm text-destructive">
              {fetcher.data.message ?? "Unable to sign out. Please try again."}
            </p>
          )}
          <DialogFooter>
            <DialogClose
              render={<Button type="button" variant="ghost" disabled={isSigningOut}>Cancel</Button>}
            />
            <fetcher.Form method="post" action="/logout">
              <Button type="submit" variant="destructive" disabled={isSigningOut}>
                <LogOut aria-hidden="true" />
                {isSigningOut ? "Signing out..." : "Yes, sign out"}
              </Button>
            </fetcher.Form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sidebar>
    
  )
}