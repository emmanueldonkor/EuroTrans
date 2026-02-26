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
import { logout, getRedirectPath } from "@/lib/auth"
import { ApiRequestError } from "@/lib/api"
import { useCurrentUser } from "@/hooks/use-current-user"
import { FullPageLoader, PageErrorState } from "@/components/ui/page-state"
import { useI18n } from "@/components/providers/i18n-provider"
import { TranslationKey } from "@/lib/i18n"

const navigation = [
  { labelKey: "nav.shipments" as TranslationKey, href: "/dashboard/shipments", icon: Package },
  { labelKey: "nav.liveMap" as TranslationKey, href: "/dashboard/map", icon: Map },
  { labelKey: "nav.fleet" as TranslationKey, href: "/dashboard/fleet", icon: Truck },
  { labelKey: "nav.employees" as TranslationKey, href: "/dashboard/employees", icon: Users },
  { labelKey: "nav.analytics" as TranslationKey, href: "/dashboard/analytics", icon: BarChart3 },
  { labelKey: "nav.documents" as TranslationKey, href: "/dashboard/documents", icon: FileText },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useI18n()
  const { data: currentUser, isLoading, error, refetch } = useCurrentUser()
  const isAuthError = error instanceof ApiRequestError && (error.status === 401 || error.status === 403)

  useEffect(() => {
    if (isLoading) return

    if (isAuthError) {
      router.replace("/auth/login")
      return
    }

    if (currentUser && currentUser.role !== "manager") {
      router.replace(getRedirectPath(currentUser.role))
    }
  }, [currentUser, isAuthError, isLoading, router])

  useEffect(() => {
    const onScroll = () => setHasScrolled(window.scrollY > 6)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!currentUser?.preferredLanguage) return
    if (currentUser.preferredLanguage !== locale) {
      setLocale(currentUser.preferredLanguage)
    }
  }, [currentUser?.preferredLanguage, locale, setLocale])

  const handleLogout = async () => {
    await logout()
  }

  if (isLoading) {
    return <FullPageLoader label="Loading manager workspace..." />
  }

  if (error && !isAuthError) {
    return (
      <PageErrorState
        title="Could not load your workspace"
        message={error instanceof Error ? error.message : "An unexpected error occurred."}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!currentUser || currentUser.role !== "manager") {
    return (
      <FullPageLoader label="Redirecting..." />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-[var(--surface-2)]/50">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:w-72 md:flex-col border-r border-sidebar-border/70 bg-sidebar text-sidebar-foreground shadow-[inset_-1px_0_0_0_color-mix(in_oklab,var(--sidebar-border)_60%,transparent)]">
          <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border/80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary/90 shadow-sm">
              <Truck className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground tracking-tight [font-family:var(--font-display)]">EuroTrans</span>
          </div>
          <nav className="flex-1 p-3.5">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 pl-4 text-sm font-medium motion-smooth ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <span
                      className={`absolute left-1 top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full motion-smooth ${
                        isActive ? "bg-sidebar-primary opacity-100 shadow-[0_0_12px_color-mix(in_oklab,var(--sidebar-primary)_60%,transparent)]" : "bg-sidebar-primary opacity-0"
                      }`}
                    />
                    <item.icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </Link>
                )
              })}
            </div>
          </nav>
          <div className="border-t border-sidebar-border/80 p-3">
            <div className="glass-surface flex items-center gap-3 rounded-lg px-3 py-2">
              <Avatar className="h-8 w-8 border border-sidebar-border">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{currentUser.name}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <aside
          className={`fixed inset-0 z-40 flex md:hidden motion-smooth ${
            sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-hidden={!sidebarOpen}
        >
          <div
            className={`fixed inset-0 bg-foreground/40 backdrop-blur-sm motion-smooth ${
              sidebarOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`relative flex w-72 flex-col bg-sidebar text-sidebar-foreground shadow-xl motion-smooth ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
              <div className="flex h-16 items-center gap-2 px-5 border-b border-sidebar-border">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-primary">
                  <Truck className="h-4 w-4 text-sidebar-primary-foreground" />
                </div>
                <span className="font-semibold tracking-tight">EuroTrans</span>
              </div>
              <nav className="flex-1 p-3.5">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 pl-4 text-sm font-medium motion-smooth ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        }`}
                      >
                        <span
                          className={`absolute left-1 top-1/2 h-6 w-1.5 -translate-y-1/2 rounded-full motion-smooth ${
                            isActive ? "bg-sidebar-primary opacity-100" : "bg-sidebar-primary opacity-0"
                          }`}
                        />
                        <item.icon className="h-4 w-4" />
                        {t(item.labelKey)}
                      </Link>
                    )
                  })}
                </div>
              </nav>
            </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header
            className={`sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/70 bg-card/85 px-4 backdrop-blur-xl md:px-6 motion-smooth ${
              hasScrolled ? "shadow-md shadow-black/5" : "shadow-none"
            }`}
          >
            <Button variant="ghost" size="icon" className="md:hidden text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <LanguageSwitcher />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/60 bg-background/70">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
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
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
