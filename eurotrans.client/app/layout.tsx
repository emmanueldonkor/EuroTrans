import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google"
import { Toaster } from "@/components/toaster"
import { Auth0Provider } from "@auth0/nextjs-auth0/client"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { ReactQueryProvider } from "@/lib/react-query"
import { I18nProvider } from "@/components/providers/i18n-provider"

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-grotesk",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
})

export const metadata: Metadata = {
  title: "EuroTrans - Fleet Management",
  description: "Centralized fleet & shipment management system",
  generator: "Emmy Dev",
  icons: {
    icon: "/eurotrans-icon.svg",
    shortcut: "/eurotrans-icon.svg",
    apple: "/eurotrans-icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
        <Auth0Provider>
          <I18nProvider>
            <ReactQueryProvider>
              {children}
            </ReactQueryProvider>
          </I18nProvider>
          <Toaster />
          <Analytics />
        </Auth0Provider>
      </body>
    </html>
  )
}
