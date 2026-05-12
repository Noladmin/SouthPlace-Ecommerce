import type { Metadata } from "next"
import { ClientToaster } from "@/components/client-toaster"

export const metadata: Metadata = {
  title: "SouthtownPlace Catering - Admin",
  description: "Admin dashboard for SouthtownPlace Catering",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <ClientToaster />
    </>
  )
} 
