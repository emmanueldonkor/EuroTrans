import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/toaster"
import { Auth0Provider } from "@auth0/nextjs-auth0/client";
import "./globals.css"
import { Geist } from "next/font/google"

const _inter = Inter({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EuroTrans - Fleet Management",
  description: "Centralized fleet & shipment management system",
  generator: "Emmy Dev",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

import { ReactQueryProvider } from "@/lib/react-query"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Auth0Provider>
          <ReactQueryProvider>
            {children}
          </ReactQueryProvider>
          <Toaster />
          <Analytics />
        </Auth0Provider>
      </body>
    </html>
  )
}
