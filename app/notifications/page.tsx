'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, Mail, CheckCircle, Trash2, Settings } from 'lucide-react'

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
        const response = await fetch('http://localhost:8000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
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
      task_assigned: <Bell className="w-4 h-4 text-blue-400" />,
      comment_added: <Mail className="w-4 h-4 text-purple-400" />,
      status_changed: <CheckCircle className="w-4 h-4 text-green-400" />,
      deadline_reminder: <Bell className="w-4 h-4 text-orange-400" />,
    }
    return icons[type] || <Bell className="w-4 h-4 text-slate-400" />
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch(`http://localhost:8000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(
        notifications.map((n) => (n._id === notificationId ? { ...n, is_read: true } : n))
      )
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch(`http://localhost:8000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(notifications.filter((n) => n._id !== notificationId))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('access_token')
      await fetch('http://localhost:8000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.is_read) : notifications

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-blue-400" />
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-slate-400 text-sm mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button onClick={markAllAsRead} className="bg-blue-600 hover:bg-blue-700 text-white">
            Mark All as Read
          </Button>
        )}
      </div>

      <Tabs defaultValue="in-app" className="w-full">
        <TabsList className="bg-slate-800 border-b border-slate-700">
          <TabsTrigger value="in-app" className="data-[state=active]:bg-slate-700">
            In-App Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-app" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-blue-600' : 'border-slate-600'}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'bg-blue-600' : 'border-slate-600'}
            >
              Unread
            </Button>
          </div>

          {loading ? (
            <Card className="p-12 bg-slate-800 border-slate-700 text-center">
              <p className="text-slate-400">Loading notifications...</p>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className="p-12 bg-slate-800 border-slate-700 text-center">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
              <p className="text-slate-400">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`p-4 border-slate-700 transition ${
                    notification.is_read
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-slate-800 border-blue-600/50 shadow-lg shadow-blue-600/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{notification.title}</h3>
                          {!notification.is_read && (
                            <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{notification.message}</p>
                        <p className="text-slate-500 text-xs">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          onClick={() => markAsRead(notification._id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteNotification(notification._id)}
                        className="border-slate-600 hover:bg-slate-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card className="p-6 bg-slate-800 border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6">Email Notification Preferences</h2>
            <div className="space-y-4">
              {Object.entries(emailSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded">
                  <label className="text-slate-200 capitalize">
                    {key.replace(/_/g, ' ')} Notifications
                  </label>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, [key]: e.target.checked })
                    }
                    className="w-5 h-5 rounded bg-slate-600 border-slate-500"
                  />
                </div>
              ))}
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-6">
              Save Preferences
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
