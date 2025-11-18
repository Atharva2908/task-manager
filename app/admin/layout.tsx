'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'
import { TopNav } from '@/components/top-nav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/auth/admin-login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      
      if (parsedUser.role !== 'admin' && parsedUser.role !== 'manager') {
        router.push('/employee/dashboard')
        return
      }
      
      setUser(parsedUser)
      setLoading(false)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/auth/admin-login')
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col">
        <TopNav user={user} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
