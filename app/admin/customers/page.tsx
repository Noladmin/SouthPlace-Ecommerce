"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "@/lib/motion"
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  Download,
  MoreHorizontal
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import AdminLayout from "@/components/admin-layout"
import type { Customer } from "@/lib/types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isExporting, setIsExporting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [searchTerm])

  const fetchCustomers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/admin/customers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch customers",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCustomers = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/admin/customers/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "customers.csv"
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Success",
          description: "Customers exported successfully",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Error",
        description: "Failed to export customers",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    return date.toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }



  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customers</h1>
            <p className="text-gray-500 mt-1">Manage your customer base and view details.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleExportCustomers}
              disabled={isExporting}
              className="h-9"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-gray-100 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-4">
                <TableSkeleton columns={6} rowCount={8} />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-gray-100 hover:bg-gray-50/50">
                    <TableHead className="font-semibold text-gray-900">Name</TableHead>
                    <TableHead className="font-semibold text-gray-900">Contact Info</TableHead>
                    <TableHead className="font-semibold text-gray-900">Location</TableHead>
                    <TableHead className="font-semibold text-gray-900">Joined Date</TableHead>
                    <TableHead className="font-semibold text-gray-900">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 mb-1">No customers found</p>
                          <p className="text-sm">Try adjusting your search criteria.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => (
                      <TableRow key={customer.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm">
                              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3 text-gray-400" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {customer.phone || "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {customer.city ? `${customer.city}` : "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(customer.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={customer.isActive ? "default" : "secondary"}
                            className={customer.isActive ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100" : "bg-gray-100 text-gray-600"}
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 text-gray-500 hover:text-gray-900">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  )
}
