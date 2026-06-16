import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { buildMetadata } from "@/lib/seo"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const GA_MEASUREMENT_ID = "G-WKFXLLRGNV"

export const metadata: Metadata = {
  metadataBase: new URL("https://zepa.design"),
  ...buildMetadata(),
  title: {
    default: "zepa ui - UI Components",
    template: "%s | zepa ui",
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
    ],
    shortcut: "/favicon-48.png",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark preloading" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  if (window.location.pathname === '/') {
                    document.documentElement.classList.add('preloading');
                  } else {
                    document.documentElement.classList.remove('preloading');
                  }
                } catch (error) {
                  document.documentElement.classList.remove('preloading');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${manrope.variable} font-sans antialiased`}>
        <div className="noise-overlay" aria-hidden="true" />
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Analytics />
      </body>
    </html>
  )
}
