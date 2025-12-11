'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)


    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })


      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Invalid credentials')
      }


      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`
      
      if (data.user.role === 'admin' || data.user.role === 'manager') {
        router.push('/admin/dashboard')
      } else {
        router.push('/employee/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card className="p-8 bg-slate-900 border-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Task Manager</h1>
        <p className="text-slate-400">Sign in to your account</p>
      </div>


      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800 text-red-400 rounded">
            {error}
          </div>
        )}


        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Email
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>


        <div>
          <label className="block text-sm font-medium text-slate-200 mb-1">
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-slate-800 border-slate-700 text-white"
            required
          />
        </div>


        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-blue-400 hover:text-blue-300 text-sm">
            Forgot password?
          </Link>
        </div>


        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>


      <div className="mt-6 text-center text-slate-400">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300">
          Sign up
        </Link>
      </div>
    </Card>
  )
}
