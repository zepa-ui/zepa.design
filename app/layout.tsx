import { ClerkProvider } from "@clerk/nextjs";
import { BookmarkProvider } from "@/components/bookmarks/bookmark-provider";
import { clerkAppearance } from "@/lib/clerk-appearance";
import type React from "react"
import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import Script from "next/script"
import { buildMetadata } from "@/lib/seo"
import { JsonLd } from "@/lib/marketing/json-ld"
import {
  organizationSchema,
  softwareApplicationSchema,
  webSiteSchema,
} from "@/lib/marketing/structured-data"
import "./globals.css"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

/**
 * Unset on localhost and preview deploys, which is the point — a hardcoded ID
 * meant dev traffic was landing in the production property. The scripts below
 * are skipped entirely when this is absent.
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  metadataBase: new URL("https://zepa.design"),
  ...buildMetadata({
    video:
      "https://res.cloudinary.com/dakrfj1oh/video/upload/v1783870699/ss_l3xle4.mp4",
  }),
  title: {
    default: "Zepa UI — Free React Components & Hero Sections | zepa.design",
    template: "%s | Zepa UI",
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
        {/* Structured data — teaches Google what "Zepa UI" is (lib/marketing/) */}
        <JsonLd data={softwareApplicationSchema()} />
        <JsonLd data={organizationSchema()} />
        <JsonLd data={webSiteSchema()} />

        {/* next/script, not a raw <script>. Raw tags worked as direct children
            of <head>, but wrapping them in a conditional means React renders
            them client-side on navigation, where inline scripts never execute —
            which is exactly what the console error reported. */}
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              id="ga-src"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        ) : null}
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
        {/* appearance set here so every Clerk surface inherits it — sign-in,
            sign-up, the avatar popup and the settings panel */}
        <ClerkProvider appearance={clerkAppearance}>
          {/* one bookmark fetch per page load, shared by every button */}
          <BookmarkProvider>
            <div className="noise-overlay" aria-hidden="true" />
            {children}
          </BookmarkProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}