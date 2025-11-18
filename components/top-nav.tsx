'use client'

import { useState, useEffect } from 'react'

interface TopNavProps {
  user: any
}

export function TopNav({ user }: TopNavProps) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch('http://localhost:8000/api/notifications?unread_only=true', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.length)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
      <div className="text-white font-semibold">
        Welcome, {user?.first_name} {user?.last_name}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button className="text-slate-300 hover:text-white text-lg">
            🔔
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
