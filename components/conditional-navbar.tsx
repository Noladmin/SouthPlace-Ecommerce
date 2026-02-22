"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/UI/Header"
import Footer from "@/components/UI/Footer"

interface ConditionalNavbarProps {
  children: React.ReactNode
}

export default function ConditionalNavbar({ children }: ConditionalNavbarProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <>
      {!isAdminRoute && <Header />}
      {children}
      {!isAdminRoute && <Footer />}
    </>
  )
}
