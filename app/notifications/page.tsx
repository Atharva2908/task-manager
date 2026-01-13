'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger, TabsContent as TabPanel } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Bell, 
  Mail, 
  CheckCircle, 
  Trash2, 
  Settings, 
  Clock,
  ChevronDown,
  Filter
} from 'lucide-react'

interface Notification {
  _id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  related_task_id?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [emailSettings, setEmailSettings] = useState({
    task_assignment: true,
    deadline_reminder: true,
    comment_added: true,
    status_changed: true,
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setNotifications(data)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      task_assigned: <Bell className="w-5 h-5 text-blue-500" />,
      comment_added: <Mail className="w-5 h-5 text-purple-500" />,
      status_changed: <CheckCircle className="w-5 h-5 text-emerald-500" />,
      deadline_reminder: <Clock className="w-5 h-5 text-orange-500" />,
    }
    return icons[type] || <Bell className="w-5 h-5 text-gray-400" />
  }

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      setNotifications(prev => 
        prev.map((n) => (n._id === notificationId ? { ...n, is_read: true } : n))
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }, [])

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      setNotifications(prev => prev.filter((n) => n._id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      setNotifications(prev => prev.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }, [])

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const savePreferences = () => {
    // TODO: Save to API
    console.log('Preferences saved:', emailSettings)
  }

  return (
    <div className="container mx-auto py-8 px-6 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-lg text-gray-400 font-medium mt-1">
                    {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead} 
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl font-medium"
            >
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-8" />

      {/* Main Tabs */}
      <Tabs defaultValue="in-app" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700/50 backdrop-blur-sm shadow-2xl rounded-2xl p-1">
          <TabsTrigger 
            value="in-app" 
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg font-medium"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg font-medium"
          >
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabPanel value="in-app" className="mt-8 space-y-6">
          {/* Filter Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={`h-12 px-6 rounded-xl font-medium transition-all duration-200 ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-xl' 
                  : 'border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                All ({notifications.length})
              </div>
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              className={`h-12 px-6 rounded-xl font-medium transition-all duration-200 ${
                filter === 'unread' 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-lg shadow-emerald-500/25 hover:shadow-xl' 
                  : 'border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Unread ({unreadCount})
              </div>
            </Button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-2xl border-opacity-50">
              <CardContent className="p-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6" />
                <p className="text-xl text-gray-400 font-medium">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm shadow-xl border-opacity-30 text-center">
              <CardContent className="p-16">
                <Bell className="w-20 h-20 text-gray-500 mx-auto mb-6 opacity-50" />
                <CardTitle className="text-2xl text-gray-400 mb-2">No notifications</CardTitle>
                <p className="text-gray-500">
                  {filter === 'unread' ? 'No unread notifications yet.' : 'Stay tuned for updates.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`group border-2 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 ${
                    notification.is_read
                      ? 'border-slate-700/50 bg-slate-800/50 backdrop-blur-sm'
                      : 'border-blue-500/30 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:shadow-blue-500/20'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                            notification.is_read 
                              ? 'bg-gray-800/50' 
                              : 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg text-white truncate group-hover:text-blue-400 transition-colors">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30 font-medium px-3 py-1 shadow-lg">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-300 leading-relaxed mb-3 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {new Date(notification.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-4">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            onClick={() => markAsRead(notification._id)}
                            className="h-9 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg font-medium text-sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Read
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteNotification(notification._id)}
                          className="h-9 w-9 p-0 hover:bg-slate-700/50 hover:text-red-400 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value="preferences" className="mt-8">
          <Card className="border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Email Preferences
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage which notifications you receive via email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(emailSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 hover:bg-slate-700/30 rounded-xl transition-colors">
                    <div>
                      <label className="text-lg font-medium text-white capitalize">
                        {key.replace(/_/g, ' ')}
                      </label>
                      <p className="text-sm text-gray-400 mt-1">
                        Receive email when {key.replace(/_/g, ' ').toLowerCase()}
                      </p>
                    </div>
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) => {
                        setEmailSettings({ ...emailSettings, [key]: !!checked })
                      }}
                      className="w-6 h-6 rounded-lg data-[state=checked]:bg-blue-600 border-2 border-slate-600 data-[state=checked]:border-blue-500"
                    />
                  </div>
                ))}
              </div>
              <Button 
                onClick={savePreferences}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-xl font-semibold text-lg rounded-2xl"
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  )
}
