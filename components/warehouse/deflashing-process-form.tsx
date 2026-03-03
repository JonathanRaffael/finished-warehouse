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
  const [spareQty, setSpareQty] = useState(0)
  const [processedBy, setProcessedBy] = useState('')
  const [loading, setLoading] = useState(false)

  // 🔥 Remaining dihitung dari processedQty
  const remaining = useMemo(
    () => data.qtyIn - data.processedQty,
    [data]
  )

  const processNow = qtyOut + ngQty
  const afterThis = remaining - processNow

  const isValid =
    processNow > 0 &&
    processNow <= remaining &&
    processedBy.trim() !== ''

  const handleSubmit = async () => {
    if (!isValid) {
      toast({
        variant: 'destructive',
        title: 'Invalid Quantity',
        description: 'Processing exceeds remaining quantity'
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch(
        `/api/deflashing/${data.id}/process`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qtyOut,
            ngQty,
            spareQty,
            processedBy
          })
        }
      )

      if (!res.ok) throw new Error()

      toast({
        title: afterThis === 0
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

  const progressPercent =
    ((data.processedQty + processNow) / data.qtyIn) * 100

  return (
    <Card className="p-8 space-y-6 border shadow-md bg-white">

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          ⚙️ Processing Panel
        </h2>

        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded">
          Remaining: {remaining}
        </span>
      </div>

      {/* Product Info */}
      <div className="bg-slate-50 p-4 rounded border">
        <p className="font-semibold">{data.computerCode}</p>
        <p className="text-xs text-slate-500">
          Total Incoming: {data.qtyIn}
        </p>
        <p className="text-xs text-blue-600">
          Already Processed: {data.processedQty}
        </p>
      </div>

      {/* Quantity Input */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-slate-500">OK</p>
          <Input
            type="number"
            min={0}
            max={remaining}
            value={qtyOut}
            onChange={e => setQtyOut(Number(e.target.value))}
          />
        </div>

        <div>
          <p className="text-xs text-slate-500">NG</p>
          <Input
            type="number"
            min={0}
            max={remaining}
            value={ngQty}
            onChange={e => setNgQty(Number(e.target.value))}
          />
        </div>

        <div>
          <p className="text-xs text-slate-500">Spare</p>
          <Input
            type="number"
            min={0}
            value={spareQty}
            onChange={e => setSpareQty(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Live Calculation */}
      <div className="text-sm space-y-1 bg-slate-50 p-4 rounded border">
        <p>
          Processing Now:{' '}
          <span className="font-bold">
            {processNow}
          </span>
        </p>

        <p>
          After This:{' '}
          <span className={`font-bold ${
            afterThis === 0
              ? 'text-green-600'
              : afterThis < 0
              ? 'text-red-600'
              : 'text-orange-600'
          }`}>
            {afterThis}
          </span>
        </p>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="w-full bg-slate-200 rounded h-2">
          <div
            className="bg-blue-600 h-2 rounded transition-all"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Operator */}
      <Input
        placeholder="Processed By *"
        value={processedBy}
        onChange={e => setProcessedBy(e.target.value)}
      />

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