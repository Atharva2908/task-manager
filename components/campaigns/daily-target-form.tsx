'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface DailyTargetFormProps {
  campaignId: string
  date: string
  initialData?: {
    data_target?: number
    calling_target?: number
  }
  onSubmit: (data: { data_target: number; calling_target: number }) => void
}

export function DailyTargetForm({ campaignId, date, initialData, onSubmit }: DailyTargetFormProps) {
  const [dataTarget, setDataTarget] = useState(initialData?.data_target || 0)
  const [callingTarget, setCallingTarget] = useState(initialData?.calling_target || 0)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit({ data_target: dataTarget, calling_target: callingTarget })
    setSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 border rounded-md">
      <h3 className="text-lg font-semibold mb-4">Daily Targets for {date}</h3>
      <Input
        type="number"
        min={0}
        value={dataTarget}
        onChange={(e) => setDataTarget(parseInt(e.target.value, 10))}
        placeholder="Data Entry Target"
      />
      <Input
        type="number"
        min={0}
        value={callingTarget}
        onChange={(e) => setCallingTarget(parseInt(e.target.value, 10))}
        placeholder="Calling Target"
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Save Targets'}
      </Button>
    </form>
  )
}
