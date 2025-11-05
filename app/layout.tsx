import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://hypeonly.xyz"),
  title: {
    default: "Hypeonly",
    template: "%s — Hypeonly",
  },
  description: "Hypeonly – Hyperliquid L1 ecosystem dashboard.",
  openGraph: {
    type: "website",
    url: "https://hypeonly.xyz",
    siteName: "Hypeonly",
    title: "Hypeonly",
    description: "Hypeonly – Hyperliquid L1 ecosystem dashboard.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Hypeonly" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hypeonly",
    description: "Hypeonly – Hyperliquid L1 ecosystem dashboard.",
    images: ["/og.jpg"],
  },
  icons: { shortcut: "/favicon.ico" },
  applicationName: "Hypeonly",
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
