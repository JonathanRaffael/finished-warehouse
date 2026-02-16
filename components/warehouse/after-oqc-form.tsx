'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface AfterOQCFormProps {
  onSuccess: () => void
  selectedQueue?: {
    id: string
    computerCode: string
    partNo: string
    productName: string
    beforeQty: number
  }
}

export function AfterOQCForm({ onSuccess, selectedQueue }: AfterOQCFormProps) {
  const { toast } = useToast()

  const [before, setBefore] = useState(0)
  const [ok, setOk] = useState(0)
  const [ng, setNg] = useState(0)
  const [spare, setSpare] = useState(0)
  const [responsiblePerson, setResponsiblePerson] = useState('')
  const [loading, setLoading] = useState(false)

  /* ================= LOAD FROM QC QUEUE ================= */

  useEffect(() => {
    if (selectedQueue) {
      setBefore(selectedQueue.beforeQty)
      setOk(0)
      setSpare(0)
      setNg(0)
    }
  }, [selectedQueue])

  const stockTotal = ok + spare
  const isInvalid = stockTotal > before || !responsiblePerson

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!selectedQueue) return

    setLoading(true)

    try {
      const res = await fetch('/api/transactions/after-oqc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedQueue.id,
          afterQty: ok,
          ngQty: ng,
          spareQty: spare,
          responsiblePerson
        })
      })

      if (!res.ok) throw new Error()

      toast({
        title: 'QC Completed',
        description: 'QC recorded successfully'
      })

      onSuccess()
      setResponsiblePerson('')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'QC submit failed'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!selectedQueue)
    return (
      <Card className="p-6 text-sm text-slate-400 text-center">
        Select item from QC Queue
      </Card>
    )

  return (
    <Card className="p-6 space-y-6 border">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">After OQC</h2>
        <span className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded">
          QC PENDING
        </span>
      </div>

      {/* PRODUCT INFO */}
      <div className="grid grid-cols-3 gap-4 bg-slate-50 border rounded p-4">
        <div>
          <p className="text-xs text-slate-500">Computer Code</p>
          <p className="font-mono font-semibold">{selectedQueue.computerCode}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Part No</p>
          <p className="font-semibold">{selectedQueue.partNo}</p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Product</p>
          <p className="font-semibold">{selectedQueue.productName}</p>
        </div>
      </div>

      {/* QC INPUT */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="text-xs">Before</label>
          <Input value={before} readOnly className="font-bold" />
        </div>

        <div>
          <label className="text-xs">OK</label>
          <Input type="number" value={ok} onChange={e => setOk(+e.target.value)} />
        </div>

        <div>
          <label className="text-xs">Spare</label>
          <Input type="number" value={spare} onChange={e => setSpare(+e.target.value)} />
        </div>

        <div>
          <label className="text-xs">NG</label>
          <Input type="number" value={ng} onChange={e => setNg(+e.target.value)} />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="flex justify-between items-center bg-slate-100 rounded px-4 py-2">
        <span className="text-sm">
          Stock Total (OK + Spare)
        </span>

        <span className={`font-bold ${stockTotal <= before ? 'text-green-600' : 'text-red-600'}`}>
          {stockTotal} / {before}
        </span>
      </div>

      {/* OPERATOR */}
      <Input
        placeholder="Responsible Person"
        value={responsiblePerson}
        onChange={e => setResponsiblePerson(e.target.value)}
      />

      {/* ACTION */}
      <Button
        disabled={isInvalid || loading}
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Submit QC'}
      </Button>

    </Card>
  )
}
