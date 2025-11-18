'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Users, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function EmployeeLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Invalid credentials')
      }

      const data = await response.json()
      
      if (data.user.role === 'admin' || data.user.role === 'manager') {
        setError('Admin accounts must use the admin login. Please use the admin login instead.')
        setLoading(false)
        return
      }

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`
      
      setTimeout(() => {
        router.push('/employee/dashboard')
      }, 100)
    } catch (err: any) {
      setError(err.message || 'Login failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="p-8 bg-slate-800 border-slate-700 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-center text-white mb-2">Employee Login</h1>
          <p className="text-center text-slate-400 mb-8">Access your task dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-2.5 rounded-lg transition-all"
            >
              {loading ? 'Signing in...' : 'Sign in as Employee'}
            </Button>
          </form>


          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center space-y-3">
            <Link href="/auth/forgot-password" className="block text-sm text-emerald-400 hover:text-emerald-300 transition">
              Forgot password?
            </Link>
            <div className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-emerald-400 hover:text-emerald-300">
                Sign up here
              </Link>
            </div>
            <Link href="/auth" className="block text-slate-400 hover:text-slate-300 text-sm transition">
              Back to role selection
            </Link>
          </div>
        </Card>

        {/* Security Badge */}
        <div className="mt-6 text-center text-xs text-slate-400">
          🔒 Secure login with encryption
        </div>
      </div>
    </div>
  )
}
