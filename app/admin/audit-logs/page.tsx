'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Download } from 'lucide-react'

interface AuditLog {
  _id: string
  action: string
  user: string
  details: string
  timestamp: string
  entity_type: string
  entity_id: string
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: 'all',
    user: '',
    dateFrom: '',
    dateTo: '',
  })

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch('http://localhost:8000/api/audit-logs', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setLogs(data)
          setFilteredLogs(data)
        }
      } catch (error) {
        console.error('Failed to fetch audit logs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  useEffect(() => {
    let filtered = logs

    if (filters.action !== 'all') {
      filtered = filtered.filter((log) => log.action === filters.action)
    }

    if (filters.user) {
      filtered = filtered.filter((log) => log.user.toLowerCase().includes(filters.user.toLowerCase()))
    }

    if (filters.dateFrom) {
      filtered = filtered.filter((log) => new Date(log.timestamp) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      filtered = filtered.filter((log) => new Date(log.timestamp) <= new Date(filters.dateTo))
    }

    setFilteredLogs(filtered)
  }, [filters, logs])

  const getActionColor = (action: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      created: { bg: 'bg-green-500/10', text: 'text-green-400' },
      updated: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
      deleted: { bg: 'bg-red-500/10', text: 'text-red-400' },
      assigned: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
      login: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
      logout: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
    }
    return colors[action] || { bg: 'bg-slate-500/10', text: 'text-slate-400' }
  }

  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`http://localhost:8000/api/audit-logs/export?format=${format}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs.${format}`
        a.click()
      }
    } catch (error) {
      console.error('Failed to export logs:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-8 h-8 text-orange-400" />
            Audit Logs
          </h1>
          <p className="text-slate-400 text-sm mt-1">System activity and user action history</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => exportLogs('csv')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button onClick={() => exportLogs('json')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Download className="w-4 h-4" />
            JSON
          </Button>
        </div>
      </div>

      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded"
          >
            <option value="all">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
            <option value="assigned">Assigned</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>

          <Input
            placeholder="Filter by user..."
            value={filters.user}
            onChange={(e) => setFilters({ ...filters, user: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
          />

          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
          />

          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
          />
        </div>
      </Card>

      {loading ? (
        <Card className="p-12 bg-slate-800 border-slate-700 text-center">
          <p className="text-slate-400">Loading audit logs...</p>
        </Card>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-12 bg-slate-800 border-slate-700 text-center">
          <p className="text-slate-400">No audit logs found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <Card key={log._id} className="p-4 bg-slate-800 border-slate-700 hover:border-slate-600 transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${getActionColor(log.action).bg} ${getActionColor(log.action).text} border-current/20 text-xs`}>
                      {log.action.toUpperCase()}
                    </Badge>
                    <p className="text-white font-semibold">{log.user}</p>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">
                    {log.entity_type}: {log.entity_id}
                  </p>
                  <p className="text-slate-500 text-xs">{log.details}</p>
                </div>
                <div className="text-right text-sm text-slate-400 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
