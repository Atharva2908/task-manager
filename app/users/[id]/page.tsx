'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { 
  Badge 
} from '@/components/ui/badge'
import { 
  Alert,
  AlertDescription 
} from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  Trash2, 
  Shield, 
  User, 
  Mail, 
  Phone, 
  Building,
  CheckCircle2,
  Calendar,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

const userSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  username: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  department: z.string().optional().default(''),
  role: z.enum(['employee', 'manager', 'admin']).default('employee'),
  is_active: z.boolean().default(true),
})

type UserFormData = z.infer<typeof userSchema>

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
  created_at?: string
}

export default function EditUserPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      username: '',
      phone: '',
      department: '',
      role: 'employee',
      is_active: true,
    },
  })

  // Transform API data to match form schema
  const transformUserData = (userData: User): UserFormData => ({
    first_name: userData.first_name || '',
    last_name: userData.last_name || '',
    email: userData.email || '',
    username: userData.username || '',
    phone: userData.phone || '',
    department: userData.department || '',
    role: (['employee', 'manager', 'admin'].includes(userData.role || '') 
      ? userData.role as any 
      : 'employee') as any,
    is_active: Boolean(userData.is_active),
  })

  // Fetch user data
  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
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
        
        // Transform data before resetting form to prevent undefined values
        const formData = transformUserData(userData)
        form.reset(formData)
      } else {
        toast.error('Failed to load user')
        router.push('/users')
      }
    } catch (error) {
      toast.error('Failed to load user')
      router.push('/users')
    } finally {
      setLoading(false)
    }
  }, [params.id, form, router])

  useEffect(() => {
    if (params.id) fetchUser()
  }, [fetchUser])

  const onSubmit = async (data: UserFormData) => {
    setSaving(true)
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
          body: JSON.stringify(data),
        }
      )

      if (response.ok) {
        toast.success('User updated successfully')
        setUser({ ...user, ...data } as User)
      } else {
        toast.error('Failed to update user')
      }
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = confirm('Are you sure? This action cannot be undone.')
    if (!confirmed) return

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
        toast.success('User deleted successfully')
        router.push('/users')
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-slate-400">Loading user data...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert variant="destructive" className="border-red-500/50">
          <AlertDescription className="text-red-400">
            User not found
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-center">
          <Link href="/users">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Users
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl border-4 border-white/20">
            <span className="text-2xl font-bold text-white">
              {user.first_name[0]}{user.last_name[0]}
            </span>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Edit Employee
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                {user.role.toUpperCase()}
              </Badge>
              {user.is_active ? 'Active' : 'Inactive'}
            </p>
          </div>
        </div>
        <Link href="/users" className="flex-shrink-0">
          <Button variant="outline" className="border-slate-600 hover:bg-slate-800 gap-2 h-12 px-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Form */}
        <Card className="xl:col-span-2 border-slate-800 shadow-2xl bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <User className="w-7 h-7 text-blue-400" />
              Employee Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Mail className="w-6 h-6 text-blue-400" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-semibold">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              className="h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-semibold">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-semibold">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john.doe@company.com"
                              className="h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-semibold">Phone (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 123-4567"
                              className="h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Advanced Settings */}
                <div className="space-y-6 pt-8 border-t border-slate-800">
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <Shield className="w-6 h-6 text-purple-400" />
                    Permissions & Team
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-semibold">Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-12 bg-slate-800/50 border-slate-700/50">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="manager">Manager</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 font-semibold">Department (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Engineering, Sales, etc."
                              className="h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500 focus:border-blue-500/50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="flex items-center gap-3 text-slate-300 font-semibold cursor-pointer group">
                            <div className={`w-5 h-5 rounded-lg border-2 transition-all ${
                              field.value 
                                ? 'bg-green-500 border-green-500' 
                                : 'bg-slate-800 border-slate-700 group-hover:border-slate-600'
                            }`}>
                              {field.value && <CheckCircle2 className="w-4 h-4 m-0.5 text-white" />}
                            </div>
                            Account Status
                          </FormLabel>
                          <FormControl>
                            <input
                              type="checkbox"
                              className="sr-only"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-sm text-slate-500 mt-2">
                            Toggle to activate/deactivate user account access
                          </p>
                          <FormMessage className="text-red-400 mt-1" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-800">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-xl hover:shadow-2xl transition-all duration-200 gap-3 text-lg font-semibold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6 xl:col-span-1">
          {/* Quick Info */}
          <Card className="border-slate-800/60 bg-slate-900/50 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-6 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-slate-400">User ID</span>
                  <code className="text-xs bg-slate-800 px-2 py-1 rounded font-mono text-slate-200">
                    {user._id.slice(-8)}
                  </code>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800/50">
                  <span className="text-slate-400">Created</span>
                  <span className="font-mono text-slate-300">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Username</span>
                  <Badge className="bg-slate-700 text-slate-300 font-mono">
                    @{user.username}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/20 bg-gradient-to-b from-red-500/5 to-red-600/5 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="w-full h-14 bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl border-red-500/50 text-white font-semibold gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete Employee
              </Button>
              <p className="text-red-400/80 text-xs mt-3 text-center font-medium">
                Permanent deletion. Cannot be undone.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
