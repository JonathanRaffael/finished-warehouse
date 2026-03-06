'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Product {
  computerCode: string
  partNo: string
  productName: string
}

interface Props {
  onSuccess: () => void
}

export function DeflashingIncomingForm({ onSuccess }: Props) {
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [computerCode, setComputerCode] = useState('')
  const [partNo, setPartNo] = useState('')
  const [productName, setProductName] = useState('')
  const [productionType, setProductionType] = useState<'HK' | 'HT'>('HT')

  const [incomingDate, setIncomingDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [qtyIn, setQtyIn] = useState(0)
  const [incomingBy, setIncomingBy] = useState('')
  const [batchNo, setBatchNo] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(setProducts)
  }, [])

  const handleComputerCodeChange = (value: string) => {
    const code = value.toUpperCase()
    setComputerCode(code)

    const found = products.find(p => p.computerCode === code)

    if (found) {
      setPartNo(found.partNo)
      setProductName(found.productName)
    } else {
      setPartNo('')
      setProductName('')
    }
  }

  const handleSubmit = async () => {
    if (!computerCode || !partNo || !productName || qtyIn <= 0 || !incomingBy) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Form',
        description: 'Please fill all required fields'
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/deflashing/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          computerCode,
          partNo,
          productName,
          productionType,
          qtyIn,
          incomingBy,
          incomingDate,
          batchNo
        })
      })

      if (!res.ok) throw new Error()

      toast({
        title: 'Incoming Saved',
        description: 'Item added to Deflashing Queue'
      })

      setComputerCode('')
      setPartNo('')
      setProductName('')
      setQtyIn(0)
      setIncomingBy('')
      setBatchNo('')

      onSuccess()

    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save incoming'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6 border">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          📥 Deflashing Incoming
        </h2>

        <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded">
          NEW ENTRY
        </span>
      </div>

      {/* PRODUCT INFORMATION */}
      <div className="bg-slate-50 border rounded p-4 space-y-3">

        <p className="text-xs text-slate-500">
          Product Information
        </p>

        <div className="grid grid-cols-3 gap-4">

          <Input
            placeholder="Computer Code *"
            value={computerCode}
            onChange={e => handleComputerCodeChange(e.target.value)}
            className="font-mono"
          />

          <Input
            value={partNo}
            readOnly
            placeholder="Part No"
          />

          <Input
            value={productName}
            readOnly
            placeholder="Product Name"
          />

        </div>

      </div>

      {/* INCOMING DETAILS */}

      <div className="bg-slate-50 border rounded p-4 space-y-3">

        <p className="text-xs text-slate-500">
          Incoming Details
        </p>

        <div className="grid grid-cols-4 gap-4">

          <select
            value={productionType}
            onChange={e => setProductionType(e.target.value as 'HK' | 'HT')}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="HT">HT</option>
            <option value="HK">HK</option>
          </select>

          <Input
            type="date"
            value={incomingDate}
            onChange={e => setIncomingDate(e.target.value)}
          />

          <Input
            type="number"
            min={0}
            placeholder="Incoming Qty *"
            value={qtyIn}
            onChange={e => setQtyIn(Number(e.target.value))}
            className="font-bold text-center"
          />

          <Input
            placeholder="Incoming By *"
            value={incomingBy}
            onChange={e => setIncomingBy(e.target.value)}
          />

        </div>

        <Input
          placeholder="Batch Number"
          value={batchNo}
          onChange={e => setBatchNo(e.target.value)}
        />

      </div>

      {/* ACTION */}
      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white"
      >
        {loading ? 'Saving Incoming...' : 'Save Incoming'}
      </Button>

    </Card>
  )
}