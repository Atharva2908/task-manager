import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DisqualifyDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string, notes: string) => void
}

export function DisqualifyDialog({ open, onClose, onSubmit }: DisqualifyDialogProps) {
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit() {
    onSubmit(reason, notes)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disqualify Lead</DialogTitle>
        </DialogHeader>
        <Select onValueChange={setReason} value={reason}>
          <SelectTrigger>
            <SelectValue placeholder="Select Reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no_answer">No Answer</SelectItem>
            <SelectItem value="not_interested">Not Interested</SelectItem>
            <SelectItem value="duplicate">Duplicate</SelectItem>
            <SelectItem value="invalid_contact">Invalid Contact</SelectItem>
            {/* Add other reasons as needed */}
          </SelectContent>
        </Select>
        <textarea
          placeholder="Optional notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full p-2 mt-2 border rounded"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!reason}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
