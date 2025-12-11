'use client'


import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react'


export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    confirm_password: '',
    role: 'employee',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)


  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    
    const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    const colors = ['red', 'orange', 'yellow', 'green', 'emerald']
    
    return {
      strength,
      label: labels[strength],
      color: colors[strength]
    }
  }


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }


  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')


    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match')
      return
    }


    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }


    setLoading(true)


    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          role: formData.role,
        }),
      })


      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.detail || 'Signup failed')
      }


      const data = await response.json()
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }


  const passwordStrength = getPasswordStrength(formData.password)


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>


      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl">
        <Card className="p-8 bg-slate-800 border-slate-700 shadow-2xl">
          {/* Header with Logo */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <Image
                src="/images/design-mode/TriMarkity-removebg-preview.png"
                alt="TriMarkity Logo"
                width={80}
                height={80}
                priority
              />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-slate-400">Join our task management platform today</p>
          </div>


          <form onSubmit={handleSignup} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-400 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}


            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  First Name
                </label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                  required
                />
              </div>
            </div>


            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                required
              />
            </div>


            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Username
              </label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20"
                required
              />
            </div>


            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Select Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20 rounded-md px-3 py-2 transition-colors"
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">
                {formData.role === 'admin' && 'Full system access and user management'}
                {formData.role === 'manager' && 'Team oversight and task assignment'}
                {formData.role === 'employee' && 'Personal task management'}
              </p>
            </div>


            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20 pr-10"
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
              
              {formData.password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          bar <= passwordStrength.strength
                            ? `bg-${passwordStrength.color}-500`
                            : 'bg-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium text-${passwordStrength.color}-400`}>
                    Strength: {passwordStrength.label}
                  </p>
                </div>
              )}
            </div>


            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>


              {formData.confirm_password && (
                <div className="mt-2 flex items-center gap-2">
                  {formData.password === formData.confirm_password ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <p className="text-xs text-emerald-400">Passwords match</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <p className="text-xs text-red-400">Passwords don't match</p>
                    </>
                  )}
                </div>
              )}
            </div>


            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-all"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>


          {/* Terms */}
          <p className="text-center text-xs text-slate-400 mt-6">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-purple-400 hover:text-purple-300">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-purple-400 hover:text-purple-300">
              Privacy Policy
            </Link>
          </p>


          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-center text-slate-400 text-sm">
            Already have an account?{' '}
            <Link href="/auth" className="text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
