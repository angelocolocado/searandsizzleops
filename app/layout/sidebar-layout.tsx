import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"
import { AppSidebar } from "~/components/sidebar/app-sidebar"
import { NavLink, Outlet, useLocation } from "react-router"
import { Toaster } from "~/components/ui/sonner"
import { Skeleton } from "~/components/ui/skeleton"
import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { getBreadcrumbs } from "~/utils/getBreadcrumbs"

type ItemType = {
  label: string,
  url: string
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const breadcrumbData = getBreadcrumbs(pathname) ?? []

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="min-w-0 flex-1 max-w-[1300px] items-center">
        <div className="border-b w-full p-4 flex items-center gap-2">
          <SidebarTrigger />

          <Breadcrumb>
            <BreadcrumbList>
              {(breadcrumbData as ItemType[]).map((item, index) => {
                const isLast = index === breadcrumbData.length - 1

                return (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink render={<NavLink to={item.url}>{item.label}</NavLink>}></BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex-1 overflow-hidden">
          <Outlet />
          <Toaster theme="dark" richColors position="top-right" />
        </div>
      </main>
    </SidebarProvider>
  )
}