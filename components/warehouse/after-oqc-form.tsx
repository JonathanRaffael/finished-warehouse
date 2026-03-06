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

  useEffect(() => {
    if (selectedQueue) {
      setBefore(selectedQueue.beforeQty)
      setOk(0)
      setSpare(0)
      setNg(0)
    }
  }, [selectedQueue])

  /* ================= CALCULATION ================= */

  const processTotal = ok + ng
  const finalStock = ok + spare

  const progress =
    before > 0 ? ((ok + ng) / before) * 100 : 0

  const isInvalid =
    !responsiblePerson ||
    ok < 0 ||
    ng < 0 ||
    spare < 0

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
          finalStock,
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
      <Card className="p-8 text-sm text-slate-400 text-center border">
        Select item from QC Queue
      </Card>
    )

  return (

    <Card className="p-6 space-y-6 border">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h2 className="text-xl font-bold">
          🧪 After OQC
        </h2>

        <span className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded">
          QC PENDING
        </span>

      </div>

      {/* PRODUCT INFO */}

      <div className="grid grid-cols-3 gap-4 bg-slate-50 border rounded p-4">

        <div>
          <p className="text-xs text-slate-500">
            Computer Code
          </p>

          <p className="font-mono font-semibold text-blue-600">
            {selectedQueue.computerCode}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Part No
          </p>

          <p className="font-semibold">
            {selectedQueue.partNo}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Product
          </p>

          <p className="font-semibold">
            {selectedQueue.productName}
          </p>
        </div>

      </div>

      {/* QC INPUT */}

      <div className="grid grid-cols-4 gap-4">

        <div>
          <label className="text-xs text-slate-500">
            Before
          </label>

          <Input
            value={before}
            readOnly
            className="font-bold text-center"
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">
            OK
          </label>

          <Input
            type="number"
            value={ok}
            onChange={e => setOk(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">
            Spare
          </label>

          <Input
            type="number"
            value={spare}
            onChange={e => setSpare(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">
            NG
          </label>

          <Input
            type="number"
            value={ng}
            onChange={e => setNg(Number(e.target.value))}
          />
        </div>

      </div>

      {/* PROGRESS */}

      <div className="space-y-2">

        <div className="flex justify-between text-xs text-slate-500">
          <span>Process Check (OK + NG)</span>
          <span>{processTotal} / {before}</span>
        </div>

        <div className="h-2 bg-slate-200 rounded">

          <div
            className="h-2 bg-green-500 rounded transition-all"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>

      {/* FINAL STOCK */}

      <div className="flex justify-between items-center bg-slate-100 rounded px-4 py-3">

        <span className="text-sm">
          Final Stock (OK + Spare)
        </span>

        <span className="font-bold text-blue-600">
          {finalStock}
        </span>

      </div>

      {/* OPERATOR */}

      <div className="space-y-1">

        <label className="text-xs text-slate-500">
          Responsible Person
        </label>

        <Input
          placeholder="Operator name"
          value={responsiblePerson}
          onChange={e => setResponsiblePerson(e.target.value)}
        />

      </div>

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