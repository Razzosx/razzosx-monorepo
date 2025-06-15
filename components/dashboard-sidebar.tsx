"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Package, ShoppingBag, Users, Settings, Home, LogOut, User, CreditCard, Bell } from "lucide-react"
import Image from "next/image"

interface DashboardSidebarProps {
  children: React.ReactNode
  hasNotifications?: boolean
}

export function DashboardSidebar({ children, hasNotifications = false }: DashboardSidebarProps) {
  const { user, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar variant="inset" className="bg-[#222831] border-r border-[#EEEEEE]/10">
          <SidebarHeader className="p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 relative">
                <Image src="/images/razzosx-logo.png" alt="Razzosx DMA" fill className="object-contain" />
              </div>
              <div className="font-bold text-[#EEEEEE] text-lg">Razzosx DMA</div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/")}>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>Store Front</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/account")}>
                      <Link href="/account">
                        <User className="h-4 w-4" />
                        <span>My Account</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive("/orders")}>
                      <Link href="/orders">
                        <CreditCard className="h-4 w-4" />
                        <span>My Orders</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                        <Link href="/dashboard">
                          <Package className="h-4 w-4" />
                          <span>Products</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname?.startsWith("/dashboard/orders")}>
                        <Link href="/dashboard?tab=orders">
                          <ShoppingBag className="h-4 w-4" />
                          <span>Orders</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname?.startsWith("/dashboard/users")}>
                        <Link href="/dashboard?tab=users">
                          <Users className="h-4 w-4" />
                          <span>Users</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={pathname?.startsWith("/dashboard/settings")}>
                        <Link href="/dashboard?tab=settings">
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href="/dashboard">
                          <Bell className="h-4 w-4" />
                          <span>Notifications</span>
                          {hasNotifications && (
                            <span className="ml-auto flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-[#00ADB5] opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ADB5]"></span>
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter>
            <div className="p-4">
              <Button
                variant="outline"
                className="w-full border-[#EEEEEE]/10 text-[#EEEEEE] hover:bg-[#EEEEEE]/10"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-[#222831]">
          <div className="flex-1 p-4">{children}</div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
