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
import { Package, Home, User, Truck, LogOut } from "lucide-react"
import { getSessionUser, logout } from "@/lib/auth"
import type { User as UserType } from "@/lib/types"

const navigation = [
  { name: "Home", href: "/driver", icon: Home },
  { name: "Shipments", href: "/driver/shipments", icon: Package },
  { name: "Profile", href: "/driver/profile", icon: User },
]

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    getSessionUser().then((userData) => {
      if (!userData || userData.role !== "driver") {
        router.push("/")
      } else {
        setUser(userData)
      }
    })
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
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-sidebar text-sidebar-foreground">
        <div className="flex h-16 items-center gap-4 px-4">
          <Link href="/driver" className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
              <Truck className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="tracking-tight">EuroTrans</span>
          </Link>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border border-sidebar-border">
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4">{children}</main>

      {/* Bottom Navigation - Mobile First */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
