"use client"

import { AlertTriangle, Trash2, Edit, Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "default" | "success" | "warning" | "info"
  onConfirm: () => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmationDialogProps) {
  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "destructive":
        return {
          icon: Trash2,
          iconColor: "text-red-600",
          confirmButtonClass: "bg-red-600 hover:bg-red-700 text-white",
          borderColor: "border-red-200"
        }
      case "success":
        return {
          icon: Plus,
          iconColor: "text-green-600",
          confirmButtonClass: "bg-green-600 hover:bg-green-700 text-white",
          borderColor: "border-green-200"
        }
      case "warning":
        return {
          icon: AlertTriangle,
          iconColor: "text-yellow-600",
          confirmButtonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
          borderColor: "border-yellow-200"
        }
      case "info":
        return {
          icon: Info,
          iconColor: "text-orange-600",
          confirmButtonClass: "bg-orange-600 hover:bg-orange-700 text-white",
          borderColor: "border-orange-200"
        }
      default:
        return {
          icon: Edit,
          iconColor: "text-orange-600",
          confirmButtonClass: "bg-orange-600 hover:bg-orange-700 text-white",
          borderColor: "border-orange-200"
        }
    }
  }

  const { icon: Icon, iconColor, confirmButtonClass, borderColor } = getVariantStyles()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-gray-50 ${borderColor} border`}>
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-600 pt-2">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            className={confirmButtonClass}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
