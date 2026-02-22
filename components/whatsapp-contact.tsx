"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WhatsAppContactProps {
  message?: string
  className?: string
  children?: React.ReactNode
}

export default function WhatsAppContact({ 
  message = "Hello! I'd like to know more about your services.", 
  className = "",
  children
}: WhatsAppContactProps) {
  const handleWhatsAppClick = () => {
    const whatsappNumber = "447376943574" // Updated number (remove spaces and +)
    const encodedMessage = encodeURIComponent(message)
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    window.open(whatsappURL, '_blank')
  }

  return (
    <Button 
      onClick={handleWhatsAppClick}
      className={`bg-green-500 hover:bg-green-600 text-white ${className}`}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {children || "Contact via WhatsApp"}
    </Button>
  )
} 