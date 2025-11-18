'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Props {
  onSubmit: (leadId: string, qualified: boolean, reason?: string) => Promise<void>
  leadId: string
}

const disqualificationReasons = [
  'No Answer',
  'Not Interested',
  'Invalid Contact',
  'Duplicate',
  'Wrong Demographic',
  'Out of Business',
]

export function LeadOutcomeForm({ leadId, onSubmit }: Props) {
  const [qualified, setQualified] = useState<boolean | null>(null)
  const [reason, setReason] = useState('')

  async function submit() {
    if (qualified === null) return alert('Please select outcome')
    if (!qualified && !reason) return alert('Please select or enter disqualification reason')
    await onSubmit(leadId, qualified, qualified ? undefined : reason)
    setQualified(null)
    setReason('')
  }

  return (
    <div className="max-w-md p-4 border rounded space-y-4">
      <div>
        <label>
          <input
            type="radio"
            name="outcome"
            checked={qualified === true}
            onChange={() => setQualified(true)}
          />
          Qualified
        </label>
      </div>
      <div>
        <label>
          <input
            type="radio"
            name="outcome"
            checked={qualified === false}
            onChange={() => setQualified(false)}
          />
          Disqualified
        </label>
      </div>

      {qualified === false && (
        <Select onValueChange={setReason} value={reason}>
          <SelectTrigger>
            <SelectValue placeholder="Select Disqualification Reason" />
          </SelectTrigger>
          <SelectContent>
            {disqualificationReasons.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Button onClick={submit}>Submit Outcome</Button>
    </div>
  )
}
