'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  achievedCallingCount: number
  achievedDataCount: number
  onSave: (calling: number, data: number) => Promise<void>
}

export function AchievedCountForm({ achievedCallingCount, achievedDataCount, onSave }: Props) {
  const [callingCount, setCallingCount] = useState(achievedCallingCount)
  const [dataCount, setDataCount] = useState(achievedDataCount)
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    await onSave(callingCount, dataCount)
    setLoading(false)
  }

  return (
    <div className="max-w-md p-4 border rounded space-y-4">
      <label>
        Achieved Calling Count
        <Input type="number" min={0} value={callingCount} onChange={(e) => setCallingCount(+e.target.value)} />
      </label>
      <label>
        Achieved Data Count
        <Input type="number" min={0} value={dataCount} onChange={(e) => setDataCount(+e.target.value)} />
      </label>
      <Button onClick={save} disabled={loading}>
        {loading ? 'Saving...' : 'Save Achieved Counts'}
      </Button>
    </div>
  )
}
