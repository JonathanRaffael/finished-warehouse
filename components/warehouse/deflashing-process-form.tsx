'use client'

import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Props {
  data: any
  onSuccess: () => void
}

export function DeflashingProcessForm({ data, onSuccess }: Props) {

  const { toast } = useToast()

  const [qtyOut, setQtyOut] = useState(0)
  const [ngQty, setNgQty] = useState(0)
  const [processedBy, setProcessedBy] = useState('')
  const [loading, setLoading] = useState(false)

  /* ================= REMAINING ================= */

  const remaining = useMemo(
    () => data.qtyIn - data.processedQty,
    [data]
  )

  /* ================= CALCULATION ================= */

  const totalProcess = qtyOut + ngQty

  const afterThis = remaining - totalProcess

  const finalStock = qtyOut

  const isValid =
    qtyOut >= 0 &&
    ngQty >= 0 &&
    totalProcess > 0 &&
    totalProcess <= remaining &&
    processedBy.trim() !== ''

  const progressPercent =
    ((data.processedQty + totalProcess) / data.qtyIn) * 100

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {

    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Invalid Quantity',
        description: 'OK + NG cannot exceed remaining quantity'
      })
      return
    }

    setLoading(true)

    try {

      const res = await fetch(`/api/deflashing/${data.id}/process`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qtyOut,
          ngQty,
          finalStock,
          processedBy
        })
      })

      if (!res.ok) throw new Error()

      toast({
        title:
          afterThis === 0
            ? 'Deflashing Completed'
            : 'Partial Process Saved',
        description:
          afterThis === 0
            ? 'All quantity has been processed'
            : 'Remaining quantity still pending'
      })

      onSuccess()

    } catch {

      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process deflashing'
      })

    } finally {

      setLoading(false)

    }

  }

  return (

    <Card className="p-6 space-y-6 border">

      {/* HEADER */}

      <div className="flex justify-between items-center">

        <h2 className="text-lg font-bold">
          ⚙️ Processing Panel
        </h2>

        <span className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded">
          Remaining: {remaining}
        </span>

      </div>

      {/* PRODUCT INFO */}

      <div className="grid grid-cols-3 gap-4 bg-slate-50 border rounded p-4">

        <div>
          <p className="text-xs text-slate-500">
            Computer Code
          </p>

          <p className="font-mono font-semibold text-blue-600">
            {data.computerCode}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Total Incoming
          </p>

          <p className="font-semibold">
            {data.qtyIn}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">
            Already Processed
          </p>

          <p className="font-semibold text-blue-600">
            {data.processedQty}
          </p>
        </div>

      </div>

      {/* INPUT QTY */}

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="text-xs text-slate-500">
            OK
          </label>

          <Input
            type="number"
            min={0}
            value={qtyOut}
            onChange={e => setQtyOut(Number(e.target.value))}
          />

        </div>

        <div>
          <label className="text-xs text-slate-500">
            NG
          </label>

          <Input
            type="number"
            min={0}
            value={ngQty}
            onChange={e => setNgQty(Number(e.target.value))}
          />

        </div>

      </div>

      {/* SUMMARY */}

      <div className="bg-slate-100 rounded px-4 py-3 space-y-2">

        <div className="flex justify-between text-sm">
          <span>Total Processing</span>
          <span className="font-bold">
            {totalProcess}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Remaining After This</span>
          <span
            className={`font-bold ${
              afterThis === 0
                ? 'text-green-600'
                : afterThis < 0
                ? 'text-red-600'
                : 'text-orange-600'
            }`}
          >
            {afterThis}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Final Stock (OK)</span>
          <span className="font-bold text-blue-600">
            {finalStock}
          </span>
        </div>

      </div>

      {/* PROGRESS */}

      <div className="space-y-2">

        <div className="flex justify-between text-xs text-slate-500">
          <span>Deflashing Progress</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>

        <div className="w-full bg-slate-200 rounded h-2">

          <div
            className="bg-blue-600 h-2 rounded transition-all"
            style={{
              width: `${Math.min(progressPercent, 100)}%`
            }}
          />

        </div>

      </div>

      {/* OPERATOR */}

      <Input
        placeholder="Processed By *"
        value={processedBy}
        onChange={e => setProcessedBy(e.target.value)}
      />

      {/* ACTION */}

      <Button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className={`w-full text-white ${
          afterThis === 0
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading
          ? 'Processing...'
          : afterThis === 0
          ? 'Complete Deflashing'
          : 'Process Partial'}
      </Button>

    </Card>

  )

}