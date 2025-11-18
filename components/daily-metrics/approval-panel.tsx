'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  isApproved: boolean
  onApprove: () => Promise<void>
  isLoading: boolean
}

export function ApprovalPanel({ isApproved, onApprove, isLoading }: Props) {
  return (
    <div className="max-w-md p-4 border rounded flex justify-between items-center">
      <span>Status: {isApproved ? 'Approved' : 'Pending Approval'}</span>
      {!isApproved && (
        <Button onClick={onApprove} disabled={isLoading}>
          {isLoading ? 'Approving…' : 'Approve Metrics'}
        </Button>
      )}
    </div>
  )
}
