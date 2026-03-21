"use client"

import { useEffect, useState } from "react"
import AdminLayout from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, Search, MessageSquare } from "lucide-react"

interface DeliveryReport {
  id?: string
  message_id?: string
  status?: string
  to?: string
  from?: string
  created_at?: string
  delivered_at?: string
  [key: string]: any
}

function formatDate(value?: string) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString("en-NG")
}

export default function AdminSMSPage() {
  const { toast } = useToast()
  const [reports, setReports] = useState<DeliveryReport[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [messageId, setMessageId] = useState("")
  const [reportById, setReportById] = useState<DeliveryReport | null>(null)
  const [lookupLoading, setLookupLoading] = useState(false)

  const fetchReports = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/admin/sms/delivery-reports?per_page=20")
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result?.details || result?.error || "Failed to load delivery reports")
      }

      const list = Array.isArray(result?.data) ? result.data : result?.data?.data || result?.data?.reports || []
      setReports(Array.isArray(list) ? list : [])
    } catch (error: any) {
      toast({
        title: "Failed to load reports",
        description: error?.message || "Unable to fetch delivery reports",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchReportById = async () => {
    if (!messageId.trim()) return

    try {
      setLookupLoading(true)
      const response = await fetch(`/api/admin/sms/delivery-reports/${encodeURIComponent(messageId.trim())}`)
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result?.details || result?.error || "Report not found")
      }

      setReportById(result?.data || null)
    } catch (error: any) {
      setReportById(null)
      toast({
        title: "Lookup failed",
        description: error?.message || "Could not fetch report by message id",
        variant: "destructive",
      })
    } finally {
      setLookupLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">SMS Reports</h1>
            <p className="text-gray-500 mt-1">Track message delivery from BulkSMS Nigeria.</p>
          </div>
          <Button onClick={fetchReports} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Find By Message ID</CardTitle>
            <CardDescription>Paste a `message_id` to check one delivery record.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="e.g. 3985f9da-824f-465a-a3eb-c1cd3fa11a59"
                value={messageId}
                onChange={(e) => setMessageId(e.target.value)}
              />
              <Button onClick={fetchReportById} disabled={lookupLoading || !messageId.trim()}>
                <Search className="h-4 w-4 mr-2" />
                {lookupLoading ? "Searching..." : "Find"}
              </Button>
            </div>

            {reportById && (
              <div className="mt-4 rounded-lg border border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-orange-600" />
                  <span className="font-semibold text-gray-900">Report Match</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <p><span className="text-gray-500">Message ID:</span> {reportById.message_id || reportById.id || "-"}</p>
                  <p><span className="text-gray-500">Status:</span> {reportById.status || "-"}</p>
                  <p><span className="text-gray-500">To:</span> {reportById.to || "-"}</p>
                  <p><span className="text-gray-500">From:</span> {reportById.from || "-"}</p>
                  <p><span className="text-gray-500">Created:</span> {formatDate(reportById.created_at)}</p>
                  <p><span className="text-gray-500">Delivered:</span> {formatDate(reportById.delivered_at)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Delivery Reports</CardTitle>
            <CardDescription>Latest records from SMS delivery-report endpoint.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">Loading reports...</p>
            ) : reports.length === 0 ? (
              <p className="text-sm text-gray-500">No reports available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Delivered</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report, idx) => {
                      const key = report.message_id || report.id || `${idx}`
                      const status = String(report.status || "").toLowerCase()
                      const badgeClass =
                        status === "delivered"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : status === "failed" || status === "undelivered"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"

                      return (
                        <TableRow key={key}>
                          <TableCell className="font-mono text-xs">{report.message_id || report.id || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={badgeClass}>
                              {report.status || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.to || "-"}</TableCell>
                          <TableCell>{report.from || "-"}</TableCell>
                          <TableCell>{formatDate(report.created_at)}</TableCell>
                          <TableCell>{formatDate(report.delivered_at)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  )
}
