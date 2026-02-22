import type { Metadata } from "next"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "South Place Catering - Admin",
  description: "Admin dashboard for South Place Catering",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
} 
