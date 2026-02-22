import type React from "react"
import Link from "next/link"

interface CTAButtonProps {
  href: string
  variant: "primary" | "secondary" | "outline"
  children: React.ReactNode
}

export default function CTAButton({ href, variant, children }: CTAButtonProps) {
  const baseClasses = "inline-flex items-center justify-center px-6 py-3 rounded-md font-medium transition-colors"

  const variantClasses = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:bg-secondary-dark",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5",
  }

  return (
    <Link href={href} className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </Link>
  )
}
