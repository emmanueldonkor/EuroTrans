"use client"

import type React from "react"

import { useEffect, useState } from "react"
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
import { logout, getRedirectPath } from "@/lib/auth"
import { ApiRequestError } from "@/lib/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCurrentUser } from "@/hooks/use-current-user"
import { FullPageLoader, PageErrorState } from "@/components/ui/page-state"
import { useI18n } from "@/components/providers/i18n-provider"
import { TranslationKey } from "@/lib/i18n"
const fullNavigation = [
  { labelKey: "nav.home" as TranslationKey, href: "/driver", icon: Home },
  { labelKey: "nav.shipments" as TranslationKey, href: "/driver/shipments", icon: Package },
  { labelKey: "nav.profile" as TranslationKey, href: "/driver/profile", icon: User },
]

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const [hasScrolled, setHasScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const { data: currentUser, isLoading, error, refetch } = useCurrentUser()
  const isAuthError = error instanceof ApiRequestError && (error.status === 401 || error.status === 403)
  const isDriver = currentUser?.role === "driver"
  const profileComplete = currentUser?.driverProfileComplete ?? false

  useEffect(() => {
    if (isLoading) return

    if (isAuthError) {
      router.replace("/auth/login")
      return
    }

    if (currentUser && currentUser.role !== "driver") {
      router.replace(getRedirectPath(currentUser.role))
    }
  }, [currentUser, isAuthError, isLoading, router])

  useEffect(() => {
    if (!currentUser || currentUser.role !== "driver") return

    const isOnProfilePage = pathname.startsWith("/driver/profile")
    if (!currentUser.driverProfileComplete && !isOnProfilePage) {
      router.replace("/driver/profile?complete=1")
    }
  }, [currentUser, pathname, router])

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return <FullPageLoader label="Loading driver workspace..." />
  }

  if (error && !isAuthError) {
    return (
      <PageErrorState
        title="Unable to load driver session"
        message={error instanceof Error ? error.message : "An unexpected error occurred."}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!currentUser || !isDriver) {
    return <FullPageLoader label="Redirecting..." />
  }

  const navigation = profileComplete
    ? fullNavigation
    : [{ labelKey: "nav.profile" as TranslationKey, href: "/driver/profile", icon: User }]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 pb-20">
      {/* Top Header */}
      <header
        className={`sticky top-0 z-50 w-full border-b bg-sidebar/95 text-sidebar-foreground backdrop-blur motion-smooth ${
          hasScrolled ? "shadow-md shadow-black/10" : "shadow-none"
        }`}
      >
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
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {error && !isAuthError && (
          <Alert variant="destructive">
            <AlertDescription>{error instanceof Error ? error.message : "Unexpected error."}</AlertDescription>
          </Alert>
        )}
        <div className="mx-auto w-full max-w-3xl">{children}</div>
      </main>

      {/* Bottom Navigation - Mobile First */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur">
        <div className="flex items-center justify-around h-[4.5rem] max-w-lg mx-auto px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex min-h-14 flex-col items-center justify-center flex-1 gap-1 rounded-lg motion-smooth ${
                  isActive
                    ? "text-primary font-semibold bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span
                  className={`absolute top-1.5 h-1.5 w-1.5 rounded-full motion-smooth ${
                    isActive ? "bg-primary opacity-100" : "bg-primary opacity-0"
                  }`}
                />
                <item.icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="text-xs font-medium">{t(item.labelKey)}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
