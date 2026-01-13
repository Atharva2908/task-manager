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
  Badge 
} from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { 
  Download, 
  FileText, 
  Activity,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  BarChart3,
  Loader2 
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Task {
  _id: string
  title: string
  status: string
  priority: string
  due_date: string
  assigned_to: string
  created_at: string
}

interface User {
  _id: string
  first_name: string
  last_name: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function ReportsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const [tasksRes, usersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, { 
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, { 
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }),
      ])

      if (tasksRes.ok) setTasks(await tasksRes.json())
      if (usersRes.ok) setUsers(await usersRes.json())
    } catch (error) {
      toast.error('Failed to load reports data')
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Memoized analytics data
  const analytics = useMemo(() => {
    const now = new Date()
    const stats = {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      pending: tasks.filter((t) => t.status === 'todo').length,
      on_hold: tasks.filter((t) => t.status === 'on_hold').length,
      overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length,
      urgent: tasks.filter((t) => t.priority === 'urgent').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0,
    }

    const chartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dateStr = date.toISOString().split('T')[0]
      const tasksCreated = tasks.filter((t) => t.created_at.split('T')[0] === dateStr).length
      const tasksCompleted = tasks.filter((t) => t.status === 'completed' && t.created_at.split('T')[0] <= dateStr).length
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created: tasksCreated,
        completed: tasksCompleted,
      }
    })

    const statusData = [
      { name: 'To Do', value: stats.pending, fill: '#64748b' },
      { name: 'In Progress', value: stats.in_progress, fill: '#3b82f6' },
      { name: 'Completed', value: stats.completed, fill: '#10b981' },
      { name: 'On Hold', value: stats.on_hold, fill: '#f59e0b' },
    ]

    const teamData = users.map((user) => {
      const userTasks = tasks.filter((t) => t.assigned_to === user._id)
      const completedCount = userTasks.filter((t) => t.status === 'completed').length
      return {
        name: `${user.first_name} ${user.last_name}`.substring(0, 12),
        tasks: userTasks.length,
        completed: completedCount,
        completion: userTasks.length > 0 ? Math.round((completedCount / userTasks.length) * 100) : 0,
      }
    }).sort((a, b) => b.completion - a.completion)

    return { stats, chartData, statusData, teamData }
  }, [tasks, users])

  const exportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setExportLoading(format)
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/export?format=${format}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tasks_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        toast.success(`${format.toUpperCase()} exported successfully`)
      } else {
        toast.error(`Failed to export ${format.toUpperCase()} report`)
      }
    } catch (error) {
      toast.error(`Export failed`)
      console.error('Export error:', error)
    } finally {
      setExportLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-xl text-slate-400">Analyzing your data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-slate-400 mt-2">Real-time insights into team performance and task metrics</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => exportReport('csv')}
            disabled={exportLoading !== null}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg gap-2 h-12 px-6"
          >
            {exportLoading === 'csv' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            CSV Export
          </Button>
          <Button
            onClick={() => exportReport('excel')}
            disabled={exportLoading !== null}
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg gap-2 h-12 px-6"
          >
            {exportLoading === 'excel' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Excel
          </Button>
          <Button
            onClick={() => exportReport('pdf')}
            disabled={exportLoading !== null}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg gap-2 h-12 px-6"
          >
            {exportLoading === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <Card className="group border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-blue-600/5 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
          <CardContent className="p-8 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 group-hover:bg-blue-500/30 rounded-xl flex items-center justify-center transition-all duration-300 border-2 border-blue-500/30">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Total Tasks</p>
            <p className="text-4xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors">{analytics.stats.total}</p>
          </CardContent>
        </Card>

        <Card className="group border-green-500/30 bg-gradient-to-br from-green-500/5 to-green-600/5 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
          <CardContent className="p-8 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent" />
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 group-hover:bg-green-500/30 rounded-xl flex items-center justify-center transition-all duration-300 border-2 border-green-500/30">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Completion Rate</p>
            <p className="text-4xl font-bold text-green-400 group-hover:text-green-300 transition-colors">
              {analytics.stats.completionRate}%
            </p>
          </CardContent>
        </Card>

        <Card className="group border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-orange-600/5 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
          <CardContent className="p-8 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />
            <div className="w-12 h-12 bg-orange-500/20 group-hover:bg-orange-500/30 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 border-2 border-orange-500/30">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">In Progress</p>
            <p className="text-4xl font-bold text-orange-400 group-hover:text-orange-300 transition-colors">{analytics.stats.in_progress}</p>
          </CardContent>
        </Card>

        <Card className="group border-red-500/30 bg-gradient-to-br from-red-500/5 to-red-600/5 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
          <CardContent className="p-8 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent" />
            <div className="w-12 h-12 bg-red-500/20 group-hover:bg-red-500/30 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 border-2 border-red-500/30">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Overdue</p>
            <p className="text-4xl font-bold text-red-400 group-hover:text-red-300 transition-colors">{analytics.stats.overdue}</p>
          </CardContent>
        </Card>

        <Card className="group border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-purple-600/5 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
          <CardContent className="p-8 relative z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent" />
            <div className="w-12 h-12 bg-purple-500/20 group-hover:bg-purple-500/30 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 border-2 border-purple-500/30">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">Urgent Tasks</p>
            <p className="text-4xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">{analytics.stats.urgent}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <Card className="border-slate-800/60 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Activity className="w-6 h-6 text-blue-400" />
              Task Progress (7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={13} />
                <YAxis stroke="#94a3b8" fontSize={13} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #475569',
                    borderRadius: '12px',
                    fontSize: '14px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="created" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  name="Created"
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 8, strokeWidth: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  name="Completed"
                  dot={{ fill: '#10b981', strokeWidth: 2 }}
                  activeDot={{ r: 8, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card className="border-slate-800/60 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <BarChart3 className="w-6 h-6 text-green-400" />
              Tasks by Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analytics.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                  cornerRadius={8}
                >
                  {analytics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={3} stroke="rgba(255,255,255,0.1)" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card className="border-slate-800/60 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50">
          <CardTitle className="flex items-center gap-3 text-xl">
            <Users className="w-6 h-6 text-purple-400" />
            Team Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-slate-700">
                  <TableHead className="font-semibold text-slate-300">Team Member</TableHead>
                  <TableHead className="font-semibold text-slate-300">Total Tasks</TableHead>
                  <TableHead className="font-semibold text-slate-300">Completed</TableHead>
                  <TableHead className="font-semibold text-slate-300 text-right">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.teamData.map((member, index) => (
                  <TableRow key={index} className="hover:bg-slate-800/50 border-b-slate-700/50 transition-colors">
                    <TableCell className="font-medium text-slate-200">{member.name}</TableCell>
                    <TableCell className="text-slate-400">{member.tasks}</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        {member.completed}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-24 bg-slate-800/50 rounded-full h-3 p-0.5">
                          <div 
                            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-lg" 
                            style={{ width: `${Math.min(member.completion, 100)}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-200 min-w-[50px]">{member.completion}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Priority Grid */}
      <Card className="border-slate-800/60 shadow-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-800/50 to-slate-700/50">
          <CardTitle className="flex items-center gap-3 text-xl">
            <AlertCircle className="w-6 h-6 text-orange-400" />
            Priority Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 lg:grid-cols-4 gap-8 p-8">
          {[
            { label: 'Urgent', value: analytics.stats.urgent, color: 'text-red-400', bg: 'from-red-500/10 to-red-600/10', icon: AlertCircle },
            { label: 'High', value: analytics.stats.high, color: 'text-orange-400', bg: 'from-orange-500/10 to-orange-600/10', icon: TrendingUp },
            { label: 'Pending', value: analytics.stats.pending, color: 'text-yellow-400', bg: 'from-yellow-500/10 to-yellow-600/10', icon: Calendar },
            { label: 'On Hold', value: analytics.stats.on_hold, color: 'text-blue-400', bg: 'from-blue-500/10 to-blue-600/10', icon: Activity },
          ].map(({ label, value, color, bg, icon: Icon }, index) => (
            <div key={index} className={`group p-6 rounded-2xl hover:shadow-xl transition-all duration-300 ${bg}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 ${bg} group-hover:scale-110 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 border border-white/10`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
              </div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wide mb-2">{label}</p>
              <p className={`text-4xl font-bold ${color} group-hover:scale-[1.02] transition-transform`}>{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
