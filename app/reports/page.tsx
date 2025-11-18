'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Download, FileText } from 'lucide-react'

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

export default function ReportsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token')  // You may keep token for other API calls
        const [tasksRes, usersRes] = await Promise.all([
          fetch('http://localhost:8000/api/tasks', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:8000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        ])

        if (tasksRes.ok) setTasks(await tasksRes.json())
        if (usersRes.ok) setUsers(await usersRes.json())
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStats = () => {
    const now = new Date()
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      pending: tasks.filter((t) => t.status === 'todo').length,
      on_hold: tasks.filter((t) => t.status === 'on_hold').length,
      overdue: tasks.filter((t) => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length,
      urgent: tasks.filter((t) => t.priority === 'urgent').length,
      high: tasks.filter((t) => t.priority === 'high').length,
    }
  }

  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      const dateStr = date.toISOString().split('T')[0]
      const tasksCreated = tasks.filter(
        (t) => t.created_at.split('T')[0] === dateStr
      ).length
      const tasksCompleted = tasks.filter(
        (t) => t.status === 'completed' && t.created_at.split('T')[0] <= dateStr
      ).length
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created: tasksCreated,
        completed: tasksCompleted,
      }
    })
    return last7Days
  }

  const getTasksByStatus = () => {
    return [
      { name: 'To Do', value: tasks.filter((t) => t.status === 'todo').length, fill: '#64748b' },
      { name: 'In Progress', value: tasks.filter((t) => t.status === 'in_progress').length, fill: '#3b82f6' },
      { name: 'Completed', value: tasks.filter((t) => t.status === 'completed').length, fill: '#10b981' },
      { name: 'On Hold', value: tasks.filter((t) => t.status === 'on_hold').length, fill: '#f59e0b' },
    ]
  }

  const getTeamProductivity = () => {
    return users.map((user) => {
      const userTasks = tasks.filter((t) => t.assigned_to === user._id)
      const completedCount = userTasks.filter((t) => t.status === 'completed').length
      return {
        name: `${user.first_name} ${user.last_name}`.substring(0, 10),
        tasks: userTasks.length,
        completed: completedCount,
        completion: userTasks.length > 0 ? Math.round((completedCount / userTasks.length) * 100) : 0,
      }
    })
  }

  const stats = getStats()
  const chartData = generateChartData()
  const statusData = getTasksByStatus()
  const teamData = getTeamProductivity()

  const StatCard = ({ label, value, color, subtext }: any) => (
    <Card className="p-6 bg-slate-800 border-slate-700">
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subtext && <p className="text-slate-500 text-xs mt-2">{subtext}</p>}
    </Card>
  )

  // UPDATED: Export without sending Authorization header (public)
  const exportReport = async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      setExportLoading(format)

      const response = await fetch(`http://localhost:8000/api/reports/export?format=${format}`, {
        method: 'GET',
        // No Authorization header sent
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

        console.log(`${format.toUpperCase()} report downloaded successfully`)
      } else {
        const errorText = await response.text()
        console.error('Export failed:', response.status, errorText)
        alert(`Failed to export ${format.toUpperCase()} report: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to export:', error)
      alert(`Error exporting ${format.toUpperCase()} report. Please try again.`)
    } finally {
      setExportLoading(null)
    }
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading reports...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-400" />
            Reports & Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Comprehensive task metrics and team performance</p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => exportReport('csv')}
            disabled={exportLoading !== null}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exportLoading === 'csv' ? 'Exporting...' : 'CSV'}
          </Button>
          <Button
            size="sm"
            onClick={() => exportReport('excel')}
            disabled={exportLoading !== null}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exportLoading === 'excel' ? 'Exporting...' : 'Excel'}
          </Button>
          <Button
            size="sm"
            onClick={() => exportReport('pdf')}
            disabled={exportLoading !== null}
            className="bg-green-600 hover:bg-green-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exportLoading === 'pdf' ? 'Exporting...' : 'PDF'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.total} color="text-blue-400" />
        <StatCard label="Completed" value={stats.completed} color="text-green-400" subtext={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% completion`} />
        <StatCard label="In Progress" value={stats.in_progress} color="text-yellow-400" />
        <StatCard label="Overdue" value={stats.overdue} color="text-red-400" subtext="Needs attention" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Task Progress (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Tasks by Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Team Productivity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-4 py-2 text-left text-slate-300 font-semibold">Team Member</th>
                <th className="px-4 py-2 text-left text-slate-300 font-semibold">Total Tasks</th>
                <th className="px-4 py-2 text-left text-slate-300 font-semibold">Completed</th>
                <th className="px-4 py-2 text-left text-slate-300 font-semibold">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {teamData.map((member, index) => (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-white">{member.name}</td>
                  <td className="px-4 py-3 text-slate-400">{member.tasks}</td>
                  <td className="px-4 py-3">
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
                      {member.completed}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-700 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${member.completion}%` }} />
                      </div>
                      <span className="text-slate-400">{member.completion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-slate-800 border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Priority Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-slate-400 text-sm mb-1">Urgent</p>
            <p className="text-2xl font-bold text-red-400">{stats.urgent}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">High</p>
            <p className="text-2xl font-bold text-orange-400">{stats.high}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">On Hold</p>
            <p className="text-2xl font-bold text-blue-400">{stats.on_hold}</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
