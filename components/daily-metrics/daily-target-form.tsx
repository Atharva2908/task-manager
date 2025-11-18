'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  dailyCallingTarget: number
  dailyDataTarget: number
  onSave: (calling: number, data: number) => Promise<void>
}

export function DailyTargetForm({ dailyCallingTarget, dailyDataTarget, onSave }: Props) {
  const [callingTarget, setCallingTarget] = useState(dailyCallingTarget)
  const [dataTarget, setDataTarget] = useState(dailyDataTarget)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    await onSave(callingTarget, dataTarget)
    setLoading(false)
  }

  return (
    <div className="max-w-md p-4 border rounded space-y-4">
      <label>
        Daily Calling Target
        <Input type="number" min={0} value={callingTarget} onChange={(e) => setCallingTarget(+e.target.value)} />
      </label>
      <label>
        Daily Data Target
        <Input type="number" min={0} value={dataTarget} onChange={(e) => setDataTarget(+e.target.value)} />
      </label>
      <Button onClick={save} disabled={loading}>
        {loading ? 'Saving...' : 'Save Targets'}
      </Button>
    </div>
  )
}
