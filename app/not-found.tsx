import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
      </p>
      <Link href="/" className="flex items-center text-primary hover:underline font-medium">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
    </div>
  )
}
