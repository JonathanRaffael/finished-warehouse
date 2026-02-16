'use client'

import React, { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Product {
  computerCode: string
  partNo: string
  productName: string
}

interface DeflashingFormProps {
  onSuccess: () => void
}

export function DeflashingForm({ onSuccess }: DeflashingFormProps) {
  const { toast } = useToast()

  /* ================= MASTER DATA ================= */
  const [products, setProducts] = useState<Product[]>([])

  /* ================= PRODUCT ================= */
  const [computerCode, setComputerCode] = useState('')
  const [partNo, setPartNo] = useState('')
  const [productName, setProductName] = useState('')

  /* ================= PROCESS TYPE ================= */
  const [processType, setProcessType] = useState<'HK' | 'HT' | ''>('')

  /* ================= QTY ================= */
  const [before, setBefore] = useState(0)
  const [ok, setOk] = useState(0)
  const [spare, setSpare] = useState(0)
  const [ng, setNg] = useState(0)

  /* ================= META ================= */
  const [responsiblePerson, setResponsiblePerson] = useState('')
  const [remark, setRemark] = useState('')
  const [loading, setLoading] = useState(false)

  /* ================= LOAD PRODUCTS ================= */
  useEffect(() => {
    fetch('/api/products', { cache: 'no-store' })
      .then(res => res.json())
      .then(setProducts)
      .catch(err => console.error('[LOAD PRODUCTS ERROR]', err))
  }, [])

  /* ================= AUTO FILL PRODUCT ================= */
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

  /* ================= CALCULATION ================= */
  const processTotal = ok + ng
  const stockResult = ok + spare
  const isBalanced = processTotal === before

  const isInvalid =
    !computerCode ||
    !partNo ||
    !productName ||
    !processType ||
    before <= 0 ||
    ok < 0 ||
    spare < 0 ||
    ng < 0 ||
    !isBalanced ||
    !responsiblePerson

  /* ================= AUTO NG ================= */
  const handleAutoNG = () => {
    if (before >= ok) {
      setNg(before - ok)
    }
  }

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/transactions/deflashing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          computerCode,
          partNo,
          productName,
          processType,
          qtyIn: before,
          qtyOut: ok,
          spareQty: spare,
          ngQty: ng,
          finalStock: stockResult,
          responsiblePerson,
          remark
        })
      })

      if (!res.ok) throw new Error()

      toast({
        title: 'Deflashing Completed',
        description: 'Deflashing recorded successfully'
      })

      /* RESET */
      setComputerCode('')
      setPartNo('')
      setProductName('')
      setProcessType('')
      setBefore(0)
      setOk(0)
      setSpare(0)
      setNg(0)
      setResponsiblePerson('')
      setRemark('')

      onSuccess()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'Deflashing submit failed'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 space-y-6 border">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Deflashing</h2>
        <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded">
          INPUT MODE
        </span>
      </div>

      {/* PRODUCT INFO */}
      <div className="grid grid-cols-3 gap-4 bg-slate-50 border rounded p-4">
        <div>
          <p className="text-xs text-slate-500">Computer Code</p>
          <Input
            value={computerCode}
            onChange={e => handleComputerCodeChange(e.target.value)}
            placeholder="Type computer code"
            className="font-mono"
          />
        </div>

        <div>
          <p className="text-xs text-slate-500">Part No</p>
          <Input value={partNo} readOnly />
        </div>

        <div>
          <p className="text-xs text-slate-500">Product</p>
          <Input value={productName} readOnly />
        </div>
      </div>

      {/* PROCESS TYPE */}
      <div className="bg-slate-50 border rounded p-4 space-y-2">
        <p className="text-xs text-slate-500">Process Type</p>

        <div className="flex gap-3">
          <Button
            type="button"
            variant={processType === 'HK' ? 'default' : 'outline'}
            onClick={() => setProcessType('HK')}
            className="w-24"
          >
            HK
          </Button>

          <Button
            type="button"
            variant={processType === 'HT' ? 'default' : 'outline'}
            onClick={() => setProcessType('HT')}
            className="w-24"
          >
            HT
          </Button>
        </div>
      </div>

      {/* INPUT QTY */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="text-xs">Before</label>
          <Input
            type="number"
            min={0}
            value={before}
            onChange={e => setBefore(Number(e.target.value))}
            className="font-bold"
          />
        </div>

        <div>
          <label className="text-xs">OK</label>
          <Input
            type="number"
            min={0}
            value={ok}
            onChange={e => setOk(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-xs">Spare</label>
          <Input
            type="number"
            min={0}
            value={spare}
            onChange={e => setSpare(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="text-xs">NG</label>
          <Input
            type="number"
            min={0}
            value={ng}
            onChange={e => setNg(Number(e.target.value))}
          />
        </div>
      </div>

      {/* SUMMARY */}
      <div className="space-y-2 bg-slate-100 rounded px-4 py-3">

        <div className="flex justify-between text-sm">
          <span>Process Check (OK + NG)</span>
          <span className={`font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
            {processTotal} / {before}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span>Stock Result (OK + Spare)</span>
          <span className="font-bold text-blue-600">
            {stockResult}
          </span>
        </div>

        {!isBalanced && (
          <div className="text-xs text-red-500">
            OK + NG must equal Before quantity
          </div>
        )}
      </div>

      {/* AUTO NG */}
      <Button type="button" variant="outline" onClick={handleAutoNG}>
        Auto Calculate NG
      </Button>

      {/* OPERATOR */}
      <Input
        placeholder="Responsible Person"
        value={responsiblePerson}
        onChange={e => setResponsiblePerson(e.target.value)}
      />

      <Input
        placeholder="Remark (optional)"
        value={remark}
        onChange={e => setRemark(e.target.value)}
      />

      {/* ACTION */}
      <Button
        disabled={isInvalid || loading}
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Submit Deflashing'}
      </Button>

    </Card>
  )
}
