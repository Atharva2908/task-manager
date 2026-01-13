'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  Button 
} from '@/components/ui/button'
import { 
  Input 
} from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Badge 
} from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { 
  Trash2, 
  Edit, 
  UserPlus, 
  MoreVertical, 
  Shield, 
  Loader2, 
  Users, 
  Filter,
  ChevronDown 
} from 'lucide-react'
import { toast } from 'sonner'

interface User {
  _id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  created_at: string
  department?: string
  phone?: string
  last_login?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [departments, setDepartments] = useState<string[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch users with professional error handling
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }
      )

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        const depts = [...new Set(data.map((u: User) => u.department).filter(Boolean))] as string[]
        setDepartments(depts)
        setFilteredUsers(data)
      } else {
        toast.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !actionLoading) fetchUsers()
    }, 30000)
    return () => clearInterval(interval)
  }, [loading, actionLoading, fetchUsers])

  // Optimized filtering
  const filtered = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(search.toLowerCase())

      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter

      return matchesSearch && matchesRole && matchesDepartment
    })
  }, [users, search, roleFilter, departmentFilter])

  useEffect(() => {
    setFilteredUsers(filtered)
  }, [filtered])

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }, [])

  const selectAll = useCallback(() => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u._id))
    }
  }, [selectedUsers.length, filteredUsers])

  const handleBulkActivate = async () => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      await Promise.all(
        selectedUsers.map((userId) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ is_active: true }),
          })
        )
      )
      toast.success(`${selectedUsers.length} users activated`)
      fetchUsers()
      setSelectedUsers([])
    } catch (error) {
      toast.error('Failed to activate users')
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      await Promise.all(
        selectedUsers.map((userId) =>
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ is_active: false }),
          })
        )
      )
      toast.success(`${selectedUsers.length} users deactivated`)
      fetchUsers()
      setSelectedUsers([])
    } catch (error) {
      toast.error('Failed to deactivate users')
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500 hover:bg-red-600 text-white',
      manager: 'bg-blue-500 hover:bg-blue-600 text-white',
      employee: 'bg-green-500 hover:bg-green-600 text-white',
    }
    return colors[role as keyof typeof colors] || 'bg-gray-500 hover:bg-gray-600 text-white'
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-500 hover:bg-green-600 text-white' 
      : 'bg-orange-500 hover:bg-orange-600 text-white'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Loading employees...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              Employee Management
            </h1>
            <p className="text-slate-500 mt-1">{filteredUsers.length} of {users.length} employees</p>
          </div>
        </div>
        <Link href="/auth/signup">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200 gap-2 h-12">
            <UserPlus className="w-5 h-5" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Filters & Search */}
      <Card className="border-slate-800 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 p-0">
          <div className="relative">
            <Input
              placeholder="Search by name, email or username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 pl-12 bg-slate-900/50 border-slate-700/50"
            />
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-12 bg-slate-900/50 border-slate-700/50">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="employee">Employee</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-12 bg-slate-900/50 border-slate-700/50">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="border-blue-800/50 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 shadow-2xl border-opacity-50">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-500/20 border-2 border-blue-500/40 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{selectedUsers.length} employees selected</p>
                <p className="text-sm text-blue-300">Choose actions below</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleBulkActivate}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 h-12 px-6 gap-2 shadow-lg"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Activate
                    <Shield className="w-4 h-4" />
                  </>
                )}
              </Button>
              <Button
                onClick={handleBulkDeactivate}
                disabled={actionLoading}
                variant="destructive"
                className="bg-orange-600 hover:bg-orange-700 h-12 px-6 gap-2 shadow-lg"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Deactivate
                    <Shield className="w-4 h-4" />
                  </>
                )}
              </Button>
              <Button
                onClick={() => setSelectedUsers([])}
                variant="ghost"
                className="h-12 px-6 border-slate-600 hover:bg-slate-800"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      {filteredUsers.length === 0 ? (
        <Card className="border-slate-800 shadow-xl text-center">
          <CardContent className="py-20">
            <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-200 mb-2">No employees found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your filters or search terms</p>
            <Button onClick={fetchUsers} className="bg-blue-600 hover:bg-blue-700">
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-800 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 border-b-slate-700/50">
            <CardTitle className="flex items-center justify-between">
              <span>Employee Directory</span>
              <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                {filteredUsers.length} employees
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-slate-700">
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          filteredUsers.length > 0 &&
                          selectedUsers.length === filteredUsers.length
                        }
                        onChange={selectAll}
                        className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Last Login</TableHead>
                    <TableHead className="w-24 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-slate-800/50 border-b-slate-700/50 transition-colors">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                          className="w-5 h-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border-2 border-blue-500/30">
                            <span className="text-xs font-semibold text-blue-400">
                              {user.first_name[0]}{user.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-200">{user.first_name} {user.last_name}</p>
                            <p className="text-sm text-slate-500">@{user.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-300">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadge(user.role)} shadow-md shadow-black/20`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="px-3 py-1 bg-slate-900/50 text-xs rounded-full text-slate-400 border border-slate-700/50">
                          {user.department || 'General'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadge(user.is_active)} shadow-md shadow-black/20`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleString('en-IN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              timeZone: 'Asia/Kolkata',
                            })
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 rounded-lg hover:bg-slate-800 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-700">
                            <Link href={`/users/${user._id}`} className="w-full">
                              <DropdownMenuItem className="cursor-pointer hover:bg-slate-800/50 w-full">
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
