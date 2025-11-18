'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface UserProfile {
  _id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch('http://localhost:8000/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setFormData((prev) => ({
            ...prev,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
          }))
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/users/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        localStorage.setItem('user', JSON.stringify(updatedProfile))
        setSuccess('Profile updated successfully!')
      } else {
        setError('Failed to update profile')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.new_password !== formData.confirm_password) {
      setError('New passwords do not match')
      return
    }

    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/users/me', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: formData.new_password,
        }),
      })

      if (response.ok) {
        setSuccess('Password updated successfully!')
        setFormData((prev) => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: '',
        }))
      } else {
        setError('Failed to update password')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading profile...</div>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-white">Account Settings</h1>

      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setActiveTab('profile')}
          className={`${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Profile Information
        </Button>
        <Button
          onClick={() => setActiveTab('password')}
          className={`${
            activeTab === 'password'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Change Password
        </Button>
      </div>

      {activeTab === 'profile' && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>

          <form onSubmit={handleProfileUpdate} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 text-red-400 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/20 border border-green-800 text-green-400 rounded">
                {success}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  First Name
                </label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Email
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-sm">
              <span className="font-medium">Role:</span> {profile?.role}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              <span className="font-medium">Username:</span> {profile?.username}
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card className="p-6 bg-slate-800 border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6">Change Password</h2>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 text-red-400 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/20 border border-green-800 text-green-400 rounded">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Current Password
              </label>
              <Input
                type="password"
                name="current_password"
                value={formData.current_password}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                New Password
              </label>
              <Input
                type="password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-white"
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
