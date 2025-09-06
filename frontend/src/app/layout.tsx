import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/ThemeProvider"
import Providers from "@/components/Providers"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import "@/styles/globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: [ "latin" ],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: [ "latin" ],
})

export const metadata: Metadata = {
  title: "Restaunax - Order Management Dashboard",
  description: "Restaurant order management system built with Next.js and Material UI",
}

export default async function RootLayout ({
  children,
}: Readonly<{
  children: React.ReactNode
}>)
{
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={ `${ geistSans.variable } ${ geistMono.variable }` }>
        <ThemeProvider>
          <Providers session={ session }>
            { children }
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
