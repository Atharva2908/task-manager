import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface BulkImportDialogProps {
  open: boolean
  onClose: () => void
  onImport: (data: string) => void
}

export function BulkImportDialog({ open, onClose, onImport }: BulkImportDialogProps) {
  const [csvData, setCsvData] = useState('')

  function handleImport() {
    onImport(csvData)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Import Leads (CSV format)</DialogTitle>
        </DialogHeader>
        <textarea
          rows={10}
          placeholder="Paste CSV data here"
          value={csvData}
          onChange={e => setCsvData(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleImport} disabled={!csvData.trim()}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
