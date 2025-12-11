'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'


export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)


    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Failed to send reset email')
      }

      setSubmitted(true)
      
      // Redirect after 5 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Card className="p-8 bg-slate-900 border-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-slate-400">Enter your email to receive reset instructions</p>
      </div>


      {submitted ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-900/20 border border-green-800 text-green-400 rounded">
            <p className="font-medium mb-1">Email sent successfully!</p>
            <p className="text-sm">Check your email for password reset instructions. Redirecting to login...</p>
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
              Email Address
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


          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Sending...' : 'Send Reset Email'}
          </Button>
        </form>
      )}


      <div className="mt-6 text-center text-slate-400">
        Remember your password?{' '}
        <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
          Sign in
        </Link>
      </div>
    </Card>
  )
}
