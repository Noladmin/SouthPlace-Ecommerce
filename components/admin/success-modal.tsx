"use client"

import { useEffect } from "react"
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  variant?: "success" | "warning" | "info" | "error"
  icon?: React.ComponentType<{ className?: string }>
  autoClose?: boolean
  autoCloseDelay?: number
  onClose?: () => void
}

export default function SuccessModal({
  open,
  onOpenChange,
  title,
  message,
  variant = "success",
  icon,
  autoClose = true,
  autoCloseDelay = 3000,
  onClose
}: SuccessModalProps) {
  useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onOpenChange(false)
        onClose?.()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [open, autoClose, autoCloseDelay, onOpenChange, onClose])

  const handleClose = () => {
    onOpenChange(false)
    onClose?.()
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800"
        }
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-yellow-600",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800"
        }
      case "error":
        return {
          icon: AlertTriangle,
          iconColor: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800"
        }
      case "info":
        return {
          icon: Info,
          iconColor: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-800"
        }
      default:
        return {
          icon: CheckCircle,
          iconColor: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          textColor: "text-green-800"
        }
    }
  }

  const { icon: DefaultIcon, iconColor, bgColor, borderColor, textColor } = getVariantStyles()
  const IconComponent = icon || DefaultIcon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`flex items-center gap-3 p-4 rounded-lg ${bgColor} ${borderColor} border`}>
            <IconComponent className={`h-6 w-6 ${iconColor}`} />
            <div className="flex-1">
              <DialogTitle className={`text-lg font-semibold ${textColor}`}>
                {title}
              </DialogTitle>
              <DialogDescription className={`${textColor} mt-1`}>
                {message}
              </DialogDescription>
            </div>
            {!autoClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        {!autoClose && (
          <div className="flex justify-end pt-4">
            <Button onClick={handleClose} className="bg-gray-600 hover:bg-gray-700 text-white">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
