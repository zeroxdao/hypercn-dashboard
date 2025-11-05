import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Hypeonly",
  description: "Hyperliquid ecosystem dashboard and analytics platform",
  generator: "v0.app",
  openGraph: {
    title: "Hypeonly",
    description: "Hyperliquid ecosystem dashboard and analytics platform",
    siteName: "Hypeonly",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypeonly",
    description: "Hyperliquid ecosystem dashboard and analytics platform",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark overflow-y-auto">
      <body className={`font-sans antialiased overflow-y-auto`}>{children}</body>
    </html>
  )
}
