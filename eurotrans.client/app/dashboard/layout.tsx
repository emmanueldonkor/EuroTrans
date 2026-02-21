"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Package, Map, Truck, Users, BarChart3, FileText, Menu, X, LogOut } from "lucide-react"
import { getSessionUser, logout, getRedirectPath } from "@/lib/auth"
import type { User } from "@/lib/types"

const navigation = [
  { name: "Shipments", href: "/dashboard/shipments", icon: Package },
  { name: "Live Map", href: "/dashboard/map", icon: Map },
  { name: "Fleet", href: "/dashboard/fleet", icon: Truck },
  { name: "Employees", href: "/dashboard/employees", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Documents", href: "/dashboard/documents", icon: FileText },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function checkAuth() {
      const userData = await getSessionUser()
      if (!userData) {
        // If no user, redirect to login
        window.location.href = "/auth/login"
        return
      }

      if (userData.role !== "manager") {
        // If unauthorized role, redirect to their allowed area
        router.push(getRedirectPath(userData.role))
      } else {
        setUser(userData)
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await logout()
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-64 md:flex-col bg-sidebar text-sidebar-foreground">
          <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
              <Truck className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground tracking-tight">EuroTrans</span>
          </div>
          <nav className="flex-1 p-3">
            <div className="space-y-0.5">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-3 rounded-md px-3 py-2">
              <Avatar className="h-8 w-8 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <aside className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="relative flex w-64 flex-col bg-sidebar text-sidebar-foreground">
              <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
                  <Truck className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <span className="font-semibold tracking-tight">EuroTrans</span>
              </div>
              <nav className="flex-1 p-3">
                <div className="space-y-0.5">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                          }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              </nav>
            </div>
          </aside>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
            <Button variant="ghost" size="icon" className="md:hidden text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
