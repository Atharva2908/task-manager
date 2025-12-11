'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface User {
  _id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
  is_active: boolean
  phone?: string
  department?: string
  manager_id?: string
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUser()
  }, [params.id])

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }
      )

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setFormData(userData)
      }
    } catch (error) {
      setError('Failed to load user')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as any
    setFormData({
      ...formData,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value,
    })
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      )

      if (response.ok) {
        setSuccess('User updated successfully')
        setUser(formData as User)
      } else {
        setError('Failed to update user')
      }
    } catch (error) {
      setError('An error occurred')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/${params.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }
      )

      if (response.ok) {
        router.push('/users')
      } else {
        setError('Failed to delete user')
      }
    } catch (error) {
      setError('An error occurred')
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading user...</div>
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <p className="text-red-400">User not found</p>
        <Link href="/users">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Link href="/users">
        <Button
          variant="ghost"
          className="text-slate-400 hover:text-slate-300 gap-2 px-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Button>
      </Link>

      <div>
        <h1 className="text-4xl font-bold text-white">Edit Employee</h1>
        <p className="text-slate-400 mt-2">
          Update employee information and permissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-8 bg-slate-800 border-slate-700 lg:col-span-2 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/50 text-green-400 rounded-lg">
              {success}
            </div>
          )}

          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  First Name
                </label>
                <Input
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Last Name
                </label>
                <Input
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Username
                </label>
                <Input
                  name="username"
                  value={formData.username || ''}
                  disabled
                  className="bg-slate-700 border-slate-600 text-slate-400"
                />
              </div>
              <div>
                <label className="block text_sm font-semibold text-slate-200 mb-2">
                  Phone
                </label>
                <Input
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Department
                </label>
                <Input
                  name="department"
                  value={formData.department || ''}
                  onChange={handleChange}
                  placeholder="e.g. Engineering, Design"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="border-t border-slate-700 pt-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Role & Permissions
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role || 'employee'}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:border-blue-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-slate-400 text-xs mt-1">
                  Admins have full access. Managers can assign and approve
                  tasks. Employees can only view their own tasks.
                </p>
              </div>

              <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active || false}
                    onChange={handleChange}
                    className="w-4 h-4 rounded"
                  />
                  <div>
                    <p className="font-medium text-white">Account Active</p>
                    <p className="text-slate-400 text-sm">
                      Deactivate to temporarily disable access
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-6 border-t border-slate-700">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h3 className="text-lg font-bold text_white mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm text-slate-400">
              <div>
                <p className="text-slate-300 font-medium">User ID</p>
                <p className="text-xs font-mono">{user._id}</p>
              </div>
              <div>
                <p className="text-slate-300 font-medium">Created</p>
                <p>{new Date(user._id).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-300 font-medium">Current Role</p>
                <p className="capitalize">{user.role}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-red-500/10 border-red-500/30">
            <h3 className="text-lg font-bold text-red-400 mb-4">Danger Zone</h3>
            <Button
              onClick={handleDelete}
              className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Employee
            </Button>
            <p className="text-red-400/70 text-xs mt-3">
              This action cannot be undone
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
