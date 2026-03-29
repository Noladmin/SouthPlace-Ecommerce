"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Shield, UserCog, UserPlus, Power, RefreshCw } from "lucide-react"
import AdminLayout from "@/components/admin-layout"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import type { Admin } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

type AdminRole = "SUPER_ADMIN_USER" | "ADMIN_USER"

type ManagedAdmin = {
  id: string
  name: string
  email: string
  role: AdminRole
  phone?: string | null
  isActive: boolean
  lastLogin?: string | null
  createdAt: string
  updatedAt: string
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  role: "ADMIN_USER" as AdminRole,
}

function roleLabel(role: AdminRole) {
  return role === "SUPER_ADMIN_USER" ? "Super Admin" : "Admin"
}

function formatDate(value?: string | null) {
  if (!value) return "Never"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Never"

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [adminUser, setAdminUser] = useState<Admin | null>(null)
  const [admins, setAdmins] = useState<ManagedAdmin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    void bootstrap()
  }, [])

  const bootstrap = async () => {
    try {
      const authResponse = await fetch("/api/auth/admin/me", { cache: "no-store" })
      if (!authResponse.ok) {
        router.push("/admin/login")
        return
      }

      const authData = await authResponse.json()
      setAdminUser(authData.admin)

      if (authData.admin?.role !== "SUPER_ADMIN_USER") {
        router.push("/admin/dashboard")
        return
      }

      await loadAdmins()
    } catch (error) {
      console.error("Admin users bootstrap error:", error)
      router.push("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }

  const loadAdmins = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to load admin users")
      }

      setAdmins(data.data || [])
    } catch (error: any) {
      toast({
        title: "Load failed",
        description: error.message || "Could not load admin users",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin user")
      }

      setForm(emptyForm)
      setIsCreateOpen(false)
      toast({
        title: "Admin created",
        description: `Temporary login details were emailed to ${data.data?.email || "the new admin"}.`,
      })
      await loadAdmins()
    } catch (error: any) {
      toast({
        title: "Create failed",
        description: error.message || "Could not create admin user",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateAdmin = async (id: string, payload: { role?: AdminRole; isActive?: boolean }) => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to update admin user")
      }

      toast({
        title: "Admin updated",
        description: data.message || "Changes saved.",
      })
      await loadAdmins()
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Could not update admin user",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-orange-600" />
      </div>
    )
  }

  if (!adminUser) {
    return null
  }

  if (adminUser.role !== "SUPER_ADMIN_USER") {
    return null
  }

  return (
    <AdminLayout adminUser={adminUser}>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Users</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create admin accounts and control who can manage the back office.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Admin User</DialogTitle>
                  <DialogDescription>
                    Add a trusted team member and assign the right admin role.
                  </DialogDescription>
                </DialogHeader>
                <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Ada Admin"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                      placeholder="ada@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Role</Label>
                    <Select
                      value={form.role}
                      onValueChange={(value: AdminRole) => setForm((current) => ({ ...current, role: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN_USER">Admin</SelectItem>
                        <SelectItem value="SUPER_ADMIN_USER">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter className="md:col-span-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Creating..." : "Create admin"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => void loadAdmins()} disabled={isRefreshing}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5" />
              Current Admin Users
            </CardTitle>
            <CardDescription>
              Promote, demote, or deactivate accounts. Super admin safeguards are enforced on the server.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500">
                      No admin users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => {
                    const isSelf = admin.id === adminUser.id
                    const nextRole: AdminRole =
                      admin.role === "SUPER_ADMIN_USER" ? "ADMIN_USER" : "SUPER_ADMIN_USER"

                    return (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-xs text-gray-500">{admin.email}</div>
                          {admin.phone ? <div className="text-xs text-gray-400">{admin.phone}</div> : null}
                        </TableCell>
                        <TableCell>
                          <Badge variant={admin.role === "SUPER_ADMIN_USER" ? "default" : "secondary"}>
                            {roleLabel(admin.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={admin.isActive ? "outline" : "secondary"}>
                            {admin.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(admin.lastLogin)}</TableCell>
                        <TableCell>{formatDate(admin.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void updateAdmin(admin.id, { role: nextRole })}
                              disabled={isSelf}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              {admin.role === "SUPER_ADMIN_USER" ? "Make admin" : "Make super"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => void updateAdmin(admin.id, { isActive: !admin.isActive })}
                              disabled={isSelf}
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {admin.isActive ? "Deactivate" : "Activate"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
