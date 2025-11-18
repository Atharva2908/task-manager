'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Trash2, Edit, UserPlus, MoreVertical, Shield, Loader } from 'lucide-react'

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

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
        
        // Extract unique departments
        const depts = [...new Set(data.map((u: User) => u.department).filter(Boolean))]
        setDepartments(depts)
        
        setFilteredUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = users.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter

      return matchesSearch && matchesRole && matchesDepartment
    })

    setFilteredUsers(filtered)
  }, [search, roleFilter, departmentFilter, users])

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleBulkActivate = async () => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      await Promise.all(
        selectedUsers.map(userId =>
          fetch(`http://localhost:8000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_active: true }),
          })
        )
      )
      await fetchUsers()
      setSelectedUsers([])
    } catch (error) {
      console.error('Failed to activate users:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleBulkDeactivate = async () => {
    setActionLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      await Promise.all(
        selectedUsers.map(userId =>
          fetch(`http://localhost:8000/api/users/${userId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_active: false }),
          })
        )
      )
      await fetchUsers()
      setSelectedUsers([])
    } catch (error) {
      console.error('Failed to deactivate users:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-red-400 bg-red-900/20 border-red-500/30'
      case 'manager':
        return 'text-blue-400 bg-blue-900/20 border-blue-500/30'
      default:
        return 'text-green-400 bg-green-900/20 border-green-500/30'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'text-green-400 bg-green-900/20 border-green-500/30'
      : 'text-slate-400 bg-slate-900/20 border-slate-500/30'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white">Employee Management</h1>
          <p className="text-slate-400 mt-2">Manage team members and permissions</p>
        </div>
        <Link href="/auth/signup">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <UserPlus className="w-4 h-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:border-blue-500"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        <div className="text-slate-400 py-2">
          {filteredUsers.length} of {users.length} employees
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4 bg-blue-500/10 border-blue-500/30 flex items-center justify-between">
          <p className="text-blue-300">{selectedUsers.length} selected</p>
          <div className="flex gap-2">
            <Button
              onClick={handleBulkActivate}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Activate'}
            </Button>
            <Button
              onClick={handleBulkDeactivate}
              disabled={actionLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm"
            >
              {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : 'Deactivate'}
            </Button>
            <Button
              onClick={() => setSelectedUsers([])}
              variant="outline"
              className="border-slate-600 text-slate-300"
              size="sm"
            >
              Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="text-center text-slate-400 py-8">Loading employees...</div>
      ) : filteredUsers.length === 0 ? (
        <Card className="p-12 bg-slate-800 border-slate-700 text-center">
          <p className="text-slate-400">No employees found</p>
        </Card>
      ) : (
        <Card className="bg-slate-800 border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-slate-200">
              <thead className="bg-slate-900 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length}
                      onChange={(e) =>
                        e.target.checked
                          ? setSelectedUsers(filteredUsers.map(u => u._id))
                          : setSelectedUsers([])
                      }
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Name</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Department</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Last Login</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => toggleUserSelection(user._id)}
                        className="w-4 h-4 rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 text-xs rounded border ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {user.department || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 text-xs rounded border ${getStatusColor(user.is_active)}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">
                      {user.last_login
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link href={`/users/${user._id}`}>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700 text-sm inline-flex"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
