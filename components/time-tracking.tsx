'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface TimeTrackingProps {
  taskId: string
  initialTimeLogged?: number
  onTimeUpdate?: (seconds: number) => void
}

export default function TimeTracking({
  taskId,
  initialTimeLogged = 0,
  onTimeUpdate,
}: TimeTrackingProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [sessions, setSessions] = useState<{ start: Date; end?: Date; duration: number }[]>([])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const handleStart = () => setIsRunning(true)

  const handlePause = () => setIsRunning(false)

  const handleSave = async () => {
    const token = localStorage.getItem('access_token')
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}/time-logs`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            duration: elapsed,
            start: new Date(Date.now() - elapsed * 1000),
            end: new Date(),
          }),
        }
      )

      if (response.ok && onTimeUpdate) {
        onTimeUpdate(elapsed)
        setElapsed(0)
        setIsRunning(false)
        setSessions((prev) => [
          ...prev,
          { start: new Date(Date.now() - elapsed * 1000), duration: elapsed },
        ])
      }
    } catch (error) {
      console.error('[v0] Failed to save time:', error)
    }
  }

  const handleReset = () => {
    setElapsed(0)
    setIsRunning(false)
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(secs).padStart(2, '0')}`
  }

  return (
    <Card className="p-4 bg-slate-800 border-slate-700">
      <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase">
        Time Tracking
      </h3>

      <div className="text-center mb-4">
        <p className="text-4xl font-bold text-blue-400 font-mono">
          {formatTime(elapsed)}
        </p>
        <p className="text-slate-400 text-xs mt-2">
          Total: {initialTimeLogged + elapsed}s
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        {!isRunning ? (
          <Button
            onClick={handleStart}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
          >
            <Play className="w-4 h-4" />
            Start
          </Button>
        ) : (
          <Button
            onClick={handlePause}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white gap-2"
          >
            <Pause className="w-4 h-4" />
            Pause
          </Button>
        )}
        <Button
          onClick={handleReset}
          variant="outline"
          className="text-slate-300 border-slate-600 hover:bg-slate-700"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <Button
        onClick={handleSave}
        disabled={elapsed === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Save Time Log
      </Button>

      {sessions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs font-semibold text-slate-300 mb-2">Sessions</p>
          <div className="space-y-1 text-xs text-slate-400">
            {sessions.map((session, idx) => (
              <p key={idx}>
                {session.start.toLocaleTimeString()} -{' '}
                {formatTime(session.duration)}
              </p>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
