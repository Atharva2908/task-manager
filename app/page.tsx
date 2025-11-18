'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/spinner'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const userData = localStorage.getItem('user')
    
    // If no token or user data, redirect to login
    if (!token || !userData) {
      router.push('/auth')
      return
    }

    // Parse user data and redirect based on role
    try {
      const user = JSON.parse(userData)
      if (user.role === 'admin' || user.role === 'manager') {
        router.push('/admin/dashboard')
      } else {
        router.push('/employee/dashboard')
      }
    } catch (error) {
      console.log('[v0] Error parsing user data:', error)
      router.push('/auth')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Show loading spinner while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="flex flex-col items-center gap-4">
        <Spinner />
        <p className="text-slate-400">Loading...</p>
      </div>
    </div>
  )
}
