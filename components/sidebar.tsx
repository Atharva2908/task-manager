'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SidebarProps {
  user: any
}

export function Sidebar({ user }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      console.error('Logout request failed:', error)
    }

    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    
    // Use a small delay to ensure the cookie is cleared before redirect
    setTimeout(() => {
      router.push('/auth')
    }, 100)
  }

  const isActive = (href: string) => pathname.startsWith(href)

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/tasks', label: 'All Tasks', icon: '📋' },
    { href: '/tasks/kanban', label: 'Kanban Board', icon: '🎯' },
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [
          { href: '/admin/assign-task', label: 'Assign Task', icon: '✉️' },
          { href: '/admin/task-assignments', label: 'Task Assignments', icon: '📌' },
          { href: '/users', label: 'Manage Users', icon: '👥' },
          { href: '/reports', label: 'Reports', icon: '📈' },
        ]
      : []),
    { href: '/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/profile', label: 'Profile', icon: '⚙️' },
  ]

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">TriMarkity</h2>
        <p className="text-slate-400 text-sm capitalize">{user?.role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={`px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Button
          onClick={handleLogout}
          className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 gap-2 justify-start"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
