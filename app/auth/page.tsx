'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShieldIcon, Users, Lock, Zap } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-4xl">
          {/* Header with Logo */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/design-mode/TriMarkity-removebg-preview.png"
                alt="TriMarkity Logo"
                width={100}
                height={100}
                priority
              />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">TriMarkity Task Manager</h1>
            <p className="text-xl text-slate-300">Select your role to get started</p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Admin Card */}
            <Card 
              onClick={() => router.push('/auth/admin-login')}
              className="p-8 bg-slate-800/50 border-slate-700 hover:border-blue-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <ShieldIcon className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
              <p className="text-slate-400 mb-6">Manage users, tasks, and system settings</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-6">
                <li className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-blue-400" />
                  Full system access
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-blue-400" />
                  User management
                </li>
                <li className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-blue-400" />
                  Advanced permissions
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Admin Login
              </Button>
            </Card>

            {/* Employee Card */}
            <Card 
              onClick={() => router.push('/auth/employee-login')}
              className="p-8 bg-slate-800/50 border-slate-700 hover:border-emerald-500 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20 group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <Users className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Employee Login</h2>
              <p className="text-slate-400 mb-6">Manage your tasks and collaborate with your team</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-6">
                <li className="flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-emerald-400" />
                  Task management
                </li>
                <li className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-emerald-400" />
                  Team collaboration
                </li>
                <li className="flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-emerald-400" />
                  Secure access
                </li>
              </ul>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Employee Login
              </Button>
            </Card>
          </div>


          {/* Signup Link */}
          <Card className="p-6 bg-slate-800/50 border-slate-700 mb-8">
            <div className="text-center">
              <p className="text-slate-300 mb-4">Don't have an account?</p>
              <Link href="/auth/signup">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Create New Account
                </Button>
              </Link>
            </div>
          </Card>

          {/* Footer */}
          <div className="text-center text-slate-400">
            <p className="text-sm">Protected by enterprise-grade security • SSL Encrypted • ISO Certified</p>
          </div>
        </div>
      </div>
    </div>
  )
}
