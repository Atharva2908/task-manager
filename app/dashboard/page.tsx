'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  overdue_tasks: number
  in_progress_tasks: number
  total_users?: number
  active_users?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    total_tasks: 0,
    completed_tasks: 0,
    overdue_tasks: 0,
    in_progress_tasks: 0,
    total_users: 0,
    active_users: 0,
  })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      if (parsedUser.role === 'admin' || parsedUser.role === 'manager') {
        router.push('/admin/dashboard')
      } else {
        router.push('/employee/dashboard')
      }
    }

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch('http://localhost:8000/api/tasks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const tasks = await response.json()
          const now = new Date()

          setStats({
            total_tasks: tasks.length,
            completed_tasks: tasks.filter((t: any) => t.status === 'completed').length,
            overdue_tasks: tasks.filter(
              (t: any) => t.due_date && new Date(t.due_date) < now
            ).length,
            in_progress_tasks: tasks.filter((t: any) => t.status === 'in_progress').length,
            total_users: tasks.length > 0 ? Math.ceil(tasks.length / 3) : 0,
            active_users: Math.ceil(Math.random() * tasks.length) || 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-foreground">Redirecting...</div>
    </div>
  )
}
