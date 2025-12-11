'use client'


import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Users, Bell, Shield } from 'lucide-react'


interface DepartmentSettings {
  _id?: string
  name: string
  manager: string
}


interface SystemSettings {
  max_file_size: number
  email_notifications_enabled: boolean
  auto_reminder_days: number
  task_auto_archive_days: number
}


export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('system')
  const [settings, setSettings] = useState<SystemSettings>({
    max_file_size: 10,
    email_notifications_enabled: true,
    auto_reminder_days: 1,
    task_auto_archive_days: 90,
  })
  const [departments, setDepartments] = useState<DepartmentSettings[]>([])
  const [newDept, setNewDept] = useState({ name: '', manager: '' })
  const [emailConfig, setEmailConfig] = useState({
    smtp_server: 'smtp.gmail.com',
    smtp_port: 587,
    sender_email: 'noreply@taskmanager.com',
    sender_name: 'Task Manager',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })


        if (response.ok) {
          const data = await response.json()
          setSettings(data.system || settings)
          setDepartments(data.departments || [])
          setEmailConfig(data.email || emailConfig)
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      }
    }


    fetchSettings()
  }, [])


  const saveSettings = async () => {
    setLoading(true)
    setSuccess('')
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          system: settings,
          email: emailConfig,
        }),
      })


      if (response.ok) {
        setSuccess('Settings updated successfully!')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setLoading(false)
    }
  }


  const addDepartment = async () => {
    if (!newDept.name) return


    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newDept),
      })


      if (response.ok) {
        const dept = await response.json()
        setDepartments([...departments, dept])
        setNewDept({ name: '', manager: '' })
        setSuccess('Department added successfully!')
      }
    } catch (error) {
      console.error('Failed to add department:', error)
    }
  }


  const deleteDepartment = async (deptId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/departments/${deptId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      setDepartments(departments.filter((d) => d._id !== deptId))
    } catch (error) {
      console.error('Failed to delete department:', error)
    }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-blue-400" />
          Admin Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">System configuration and management</p>
      </div>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-800 border-b border-slate-700">
          <TabsTrigger value="system" className="data-[state=active]:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-slate-700">
            <Users className="w-4 h-4 mr-2" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-slate-700">
            <Bell className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-slate-700">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>


        <TabsContent value="system" className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">System Configuration</h2>
            {success && (
              <div className="p-3 bg-green-900/20 border border-green-800 text-green-400 rounded mb-4">
                {success}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Maximum File Upload Size (MB)
                </label>
                <Input
                  type="number"
                  value={settings.max_file_size}
                  onChange={(e) => setSettings({ ...settings, max_file_size: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Auto Reminder Days Before Deadline
                </label>
                <Input
                  type="number"
                  value={settings.auto_reminder_days}
                  onChange={(e) => setSettings({ ...settings, auto_reminder_days: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Auto Archive Completed Tasks After (days)
                </label>
                <Input
                  type="number"
                  value={settings.task_auto_archive_days}
                  onChange={(e) => setSettings({ ...settings, task_auto_archive_days: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <div className="flex items-center gap-4 p-4 bg-slate-700/50 rounded">
                <input
                  type="checkbox"
                  checked={settings.email_notifications_enabled}
                  onChange={(e) => setSettings({ ...settings, email_notifications_enabled: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label className="text-slate-200">Enable Email Notifications System-wide</label>
              </div>


              <Button
                onClick={saveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white mt-6"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </Card>
        </TabsContent>


        <TabsContent value="departments" className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Department Management</h2>


            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Department Name
                </label>
                <Input
                  value={newDept.name}
                  onChange={(e) => setNewDept({ ...newDept, name: e.target.value })}
                  placeholder="e.g., Engineering, Marketing"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Department Manager
                </label>
                <Input
                  value={newDept.manager}
                  onChange={(e) => setNewDept({ ...newDept, manager: e.target.value })}
                  placeholder="Manager email or name"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <Button
                onClick={addDepartment}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add Department
              </Button>
            </div>


            <div className="space-y-2">
              {departments.map((dept) => (
                <div key={dept._id} className="p-4 bg-slate-700/50 rounded flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{dept.name}</p>
                    <p className="text-slate-400 text-sm">Manager: {dept.manager}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteDepartment(dept._id!)}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>


        <TabsContent value="email" className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Email Configuration</h2>


            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  SMTP Server
                </label>
                <Input
                  value={emailConfig.smtp_server}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtp_server: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  SMTP Port
                </label>
                <Input
                  type="number"
                  value={emailConfig.smtp_port}
                  onChange={(e) => setEmailConfig({ ...emailConfig, smtp_port: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Sender Email
                </label>
                <Input
                  type="email"
                  value={emailConfig.sender_email}
                  onChange={(e) => setEmailConfig({ ...emailConfig, sender_email: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Sender Name
                </label>
                <Input
                  value={emailConfig.sender_name}
                  onChange={(e) => setEmailConfig({ ...emailConfig, sender_name: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>


              <Button
                onClick={saveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white mt-6"
              >
                Save Email Configuration
              </Button>
            </div>
          </Card>
        </TabsContent>


        <TabsContent value="security" className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Security Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded">
                <p className="text-white font-semibold mb-2">Session Management</p>
                <p className="text-slate-400 text-sm mb-4">
                  Manage user session timeouts and security policies
                </p>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  Configure Sessions
                </Button>
              </div>


              <div className="p-4 bg-slate-700/50 rounded">
                <p className="text-white font-semibold mb-2">Audit Logs</p>
                <p className="text-slate-400 text-sm mb-4">
                  View system activity and user actions for security monitoring
                </p>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  View Audit Logs
                </Button>
              </div>


              <div className="p-4 bg-slate-700/50 rounded">
                <p className="text-white font-semibold mb-2">Backup Settings</p>
                <p className="text-slate-400 text-sm mb-4">
                  Configure automated backups and data retention
                </p>
                <Button variant="outline" className="border-slate-600 text-slate-300">
                  Configure Backups
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
