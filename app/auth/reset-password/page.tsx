'use client'


import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'


function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)


  useEffect(() => {
    const resetToken = searchParams.get('token')
    if (!resetToken) {
      setError('Invalid reset link')
    } else {
      setToken(resetToken)
    }
  }, [searchParams])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')


    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }


    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }


    setLoading(true)


    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, new_password: password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to reset password')
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card className="p-8 bg-slate-900 border-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Set New Password</h1>
        <p className="text-slate-400">Create a new password for your account</p>
      </div>


      {success ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-900/20 border border-green-800 text-green-400 rounded">
            <p className="font-medium mb-1">Password reset successfully!</p>
            <p className="text-sm">Redirecting to login...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 text-red-400 rounded">
              {error}
            </div>
          )}


          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              New Password
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


          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>


          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      )}


      <div className="mt-6 text-center text-slate-400">
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
          Back to sign in
        </Link>
      </div>
    </Card>
  )
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
